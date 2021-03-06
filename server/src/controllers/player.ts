import { Request, Response } from 'express';

import { GameStatus, TeamStatus } from '../../../types/status';
import { createTeamRecord, hasTeam, updateTeam, getTeamValue, getByPlayerCode } from '../repositories/team-realtime';
import { hasGame, getGameRecord, getGameValue } from '../repositories/game-realtime';
import { TeamSession, getTeamSessionRepository } from '../repositories/team-sessions';
import { getTeamAnswerRepository, TeamAnswer } from '../repositories/team-answers';
import { HasSessionResponse, JoinGameResponse, JoinGameRequest, SubmitAnswerRequest, SubmitAnwserResponse } from '../../../types/player';
import { getByGameRoom } from '../repositories/game-config';
import { JoinGameErrorReason, SubmitAnswerErrorReason } from '../../../types/enum';

export async function hasPlayerSession(req: Request, res: Response<HasSessionResponse>) {
  try {
    const { gameId, teamId } = res.locals;

    const game = await getGameRecord(gameId).once('value');
    const team = await getTeamValue(gameId, teamId);

    const hasSession = game.exists() && game.val().status !== GameStatus.EndGame && (team.status === TeamStatus.Joined || team.status === TeamStatus.Waiting);

    res.json({
      success: true,
      hasSession,
      gameRoom: gameId,
      teamId,
      serverTimeNow: Date.now()
    });
  } catch (err) {
    res.json({ success: false });
  }
}

export async function join(req: Request, res: Response<JoinGameResponse>) {
  const body = req.body as JoinGameRequest;

  if (!body.gameRoom || !body.teamName || !body.playerCode) {
    res.json({
      success: true,
      errorReason: JoinGameErrorReason.MissingValues
    });
    return;
  }

  if (!body.acceptedTerms) {
    res.json({
      success: true,
      errorReason: JoinGameErrorReason.TermsNotAccepted
    });
    return;
  }

  const teamName = body.teamName.trim();
  const gameRoom = body.gameRoom.trim().toUpperCase();
  const playerCode = body.playerCode.trim().toUpperCase();

  const hasGameRoom = await hasGame(gameRoom);

  if (!hasGameRoom) {
    res.json({
      success: true,
      errorReason: JoinGameErrorReason.GameRoomNotFound
    });
    return;
  }

  const isTeamNameTaken = await hasTeam(gameRoom, teamName);

  if (isTeamNameTaken) {
    res.json({
      success: true,
      errorReason: JoinGameErrorReason.TeamNameTaken
    });

    return;
  }

  const gameConfig = await getByGameRoom(gameRoom);

  const isAuthorisedPlayerCode = gameConfig.authorisedPlayerCodes.includes(playerCode);

  if (!isAuthorisedPlayerCode) {
    res.json({
      success: true,
      errorReason: JoinGameErrorReason.PlayerCodeInvalid
    });

    return;
  }

  const existingPlayerCodeTeam = await getByPlayerCode(gameRoom, playerCode);

  if (existingPlayerCodeTeam) {
    const existingTeamId = existingPlayerCodeTeam.teamId;
    const newExistingTeamObject = {
      ...existingPlayerCodeTeam,
      status: TeamStatus.Blocked
    };

    delete newExistingTeamObject.teamId;

    updateTeam(gameRoom, existingTeamId, newExistingTeamObject);
  }

  const teamRdbRef = await createTeamRecord(gameRoom, {
    teamName,
    gameRoom,
    playerCode,
    status: TeamStatus.Joined,
    score: 0
  });

  const teamSession = new TeamSession();
  teamSession.teamId = teamRdbRef.key;
  teamSession.gameId = gameRoom;

  const teamSessionObject = await getTeamSessionRepository().create(teamSession);

  res.cookie('__session', teamSessionObject.id, { maxAge: 86400000, httpOnly: true, sameSite: 'strict' });

  res.json({
    success: true,
    teamId: teamRdbRef.key,
    errorReason: JoinGameErrorReason.Ok,
    gameRoom
  });
}

export async function submitAnswer(req: Request, res: Response<SubmitAnwserResponse>) {
  const now = new Date().getTime();

  const { gameId, teamId } = res.locals;
  const { questionId, answer } = req.body as SubmitAnswerRequest;

  if (!questionId || !answer) {
    res.json({ success: true, errorReason: SubmitAnswerErrorReason.MissingAnswer });

    return;
  }

  const team = await getTeamValue(gameId, teamId);

  if (team.status !== TeamStatus.Joined) {
    res.json({ success: true, errorReason: SubmitAnswerErrorReason.PlayerNotAuthorised });

    return;
  }

  const game = await getGameValue(gameId);

  if (game.status !== GameStatus.AskingQuestion && game.question.questionId !== questionId) {
    res.json({ success: true, errorReason: SubmitAnswerErrorReason.QuestionClosed });

    return;
  }

  const existingTeamAnswer = await getTeamAnswerRepository()
    .whereEqualTo('gameId', gameId)
    .whereEqualTo('teamId', teamId)
    .whereEqualTo('questionId', questionId)
    .findOne();

  if (existingTeamAnswer) {
    existingTeamAnswer.answer = answer;
    existingTeamAnswer.timestamp = now;

    await getTeamAnswerRepository().update(existingTeamAnswer);
  } else {
    const teamAnswer = new TeamAnswer();
    teamAnswer.gameId = gameId;
    teamAnswer.teamId = teamId;
    teamAnswer.questionId = questionId;
    teamAnswer.answer = answer;
    teamAnswer.timestamp = now;

    await getTeamAnswerRepository().create(teamAnswer);
  }

  res.json({
    success: true,
    errorReason: SubmitAnswerErrorReason.Ok
  });
}

export async function getDebug(req: Request, res: Response) {
  res.json({
    success: true,
    locals: res.locals
  });
}

export async function leaveGame(req: Request, res: Response) {
  const { gameId, teamId } = res.locals;

  await updateTeam(gameId, teamId, { status: TeamStatus.Quit });

  res.clearCookie('__session');

  res.json({ success: true });
}
