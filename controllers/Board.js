const User = require('../models/User')
const Board = require('../models/Board')
const {
  checkUserBoardPermissions,
  apiMessages
} = require('../helpers/index')


module.exports = {
  createBoard: async (req, res, next) => {
    const { title, lists, users, id } = req.body;
    let userId = id;
    let board;
    console.log('api hit,', req.body)
    Board.create({
      title,
      lists: [],
      users: [userId]
    })
      .then(result => {
        board = result;
        return User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { boards: board }
          },
          { new: true }
        );
      })
      .then(result => {
        console.log('resultSSSS', result)
        res.json({
          message: apiMessages.successfulPost,
          data: board
        });
      })
      .catch(error => next(error));
  },
  getAllBoards: async (req, res, next) => {
    try {
      const result = await Board.find({}).populate({
        path: "lists",
        populate: {
          path: "cards",
          populate: {
            path: "members"
          }
        }
      })
      // const res2 = Board.find({})
      // console.
      console.log('result', result)
      return res.json({
        data: result
      })
    } catch (error) {

    }
  },

  readBoard: async (req, res, next) => {

    const boardId = req.params.id

    console.log(req.params, req.user)
    Board.findById(boardId)
      .populate({
        path: "lists",
        populate: {
          path: "cards",
          populate: {
            path: "members"
          }
        }
      })
      .then(board => {
        if (!board) {
          throw new Error('Board not found')
        }
        console.log('board', board)
        let canCurrentUserGet = checkUserBoardPermissions(board, req.user._id);
        if (!canCurrentUserGet) {
          throw new Error('Not authenticated for this board')
        }

        res.json({
          data: board
        })
      })
      .catch(err => next(err));
  },
  addUserToBoard: async (req, res, next) => {
    const boardId = req.params.id;
    const userToAdd = req.params.userId;
    let updatedBoard;

    Board.findById(boardId)
      .then(board => {
        if (!board) {
          throw new Error('Board not found');
        }
        let canCurrentUserEdit = checkUserBoardPermissions(board, req.user.id);

        if (!canCurrentUserEdit) {
          throw new Error('Forbidden resource');
        }

        // Add the user to the board's array
        return Board.findByIdAndUpdate(
          boardId,
          {
            $addToSet: { users: userToAdd }
          },
          { new: true }
        );
      })
      .then(result => {
        updatedBoard = result;

        // Then update corresponding user
        return User.findByIdAndUpdate(
          userToAdd,
          {
            $addToSet: { boards: updatedBoard }
          },
          { new: true }
        );
      })
      .then(result => {
        res.json({
          message: apiMessages.successfulPut,
          data: {
            board: updatedBoard,
            user: result
          }
        });
      })
      .catch(error => next(error));
  },
  deleteBoard: async (req, res, next) => {
    const boardId = req.params.id;
    let deletedBoard;

    Board.findById(boardId)
      .then(board => {
        if (!board) {
          throw new Error('Board not found');
        }
        let canCurrentUserDelete = checkUserBoardPermissions(board, req.user.id);
        if (!canCurrentUserDelete) {
          throw new Error('Forbidden resource');
        }

        return Board.findByIdAndRemove(boardId);
      })
      .then(result => {
        deletedBoard = result;
        return User.update(
          { boards: { $in: [deletedBoard.id] } },
          {
            $pull: { boards: deletedBoard.id }
          },
          { multi: true }
        );
      })
      .then(() => {
        res.json({
          message: apiMessages.successfulDelete,
          data: {
            deletedResource: deletedBoard
          }
        });
      })
      .catch(error => next(error));
  }
}