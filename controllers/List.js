const List = require('../models/List')
const Board = require('../models/Board')
const {
  checkUserBoardPermissions,
  apiMessages
} = require('../helpers/index')

module.exports = {
  createList: async (req, res, next) => {
    const { title, description, boardId } = req.body;
    let newList;
    Board.findById(boardId)
      .then(board => {
        if (!board) {
          throw new Error('Board not found');
        }
        // let canCurrentUserCreate = checkUserBoardPermissions(board, req.user.id);

        // if (!canCurrentUserCreate) {
        //   throw new Error('Forbidden resource');
        // }

        return List.create({
          title: title || "New List",
          description: description || "Enter a description here",
          cards: [],
          board: boardId
        });
      })
      .then(result => {
        newList = result;
        return Board.findByIdAndUpdate(boardId, {
          $addToSet: { lists: result.id }
        });
      })
      .then(() => {
        res.json({
          message: apiMessages.successfulPost,
          data: newList
        });
      })
      .catch(error => next(error));
  },

  getAllList: async (req, res, next) => {
    const boardId = req.params.id;
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
          throw new Error('Board not found');
        }

        let canCurrentUserGet = checkUserBoardPermissions(board, req.user.id);
        if (!canCurrentUserGet) {
          throw new Error('Forbidden resource');
        }

        res.json({
          data: board.lists
        });
      })
      .catch(error => next(error));
  },

  updateList: async (req, res, next) => {
    const listId = req.params.id;
    const { title, description } = req.body;

    List.findById(listId)
      .populate("board")
      .then(list => {
        if (!list) {
          throw new Error(apiMessages.doesNotExist("List"));
        }

        let canCurrentUserDelete = checkUserBoardPermissions(
          list.board,
          req.user.id
        );
        if (!canCurrentUserDelete) {
          throw new Error(apiMessages.failedAuth);
        }

        return List.findByIdAndUpdate(
          listId,
          {
            title: title || list.title,
            description: description || list.description
          },
          { new: true }
        ).populate({
          path: "cards",
          populate: {
            path: "members"
          }
        });
      })
      .then(result => {
        res.json({
          message: apiMessages.successfulPut,
          data: result
        });
      });
  },
  deleteList: async (req, res, next) => {
    const listId = req.params.id;
    let deletedList;
    List.findById(listId)
      .populate("board")
      .then(list => {
        if (!list) {
          throw new Error(apiMessages.doesNotExist("List"));
        }

        let canCurrentUserDelete = checkUserBoardPermissions(
          list.board,
          req.user.id
        );
        if (!canCurrentUserDelete) {
          throw new Error(apiMessages.failedAuth);
        }

        return List.findByIdAndRemove(listId);
      })
      .then(result => {
        deletedList = result;
        return Board.update(
          { lists: { $in: [deletedList.id] } },
          {
            $pop: { lists: deletedList }
          }
        );
      })
      .then(() => {
        res.json({
          message: apiMessages.successfulDelete,
          data: {
            deletedResource: deletedList
          }
        });
      })
      .catch(error => next(error));
  }
}