const User = require('../models/User')
const Board = require('../models/Board')
const List = require('../models/List')
const Card = require('../models/Card')
const Activity = require('../models/Card')
const {
  checkUserBoardPermissions,
  apiMessages
} = require('../helpers/index')

module.exports = {
  getCard: async (req, res, next) => {
    const cardId = req.params.id;

    Card.findById(cardId)
      .populate([
        {
          path: "list",
          populate: {
            path: "board"
          }
        },
        {
          path: "activities"
        },
        {
          path: "members"
        }
      ])
      .then(card => {
        if (!card) {
          throw new Error(apiMessages.doesNotExist("Card"));
        }

        let canCurrentUserGet = checkUserBoardPermissions(
          card.list.board,
          req.user.id
        );

        if (!canCurrentUserGet) {
          throw new Error(apiMessages.failedAuth);
        }

        res.json({
          message: apiMessages.successfulDelete,
          data: card
        });
      })
      .catch(error => next(error));
  },
  createCard: async (req, res, next) => {
    const { title, description, listId } = req.body;
    let newCard;
    List.findById(listId)
      .populate("board")
      .then(list => {
        if (!list) {
          throw new Error(apiMessages.doesNotExist("List"));
        }
        // let canCurrentUserEdit = checkUserBoardPermissions(
        //   list.board,
        //   listId
        // );

        // if (!canCurrentUserEdit) {
        //   throw new Error(apiMessages.failedAuth);
        // }

        return Card.create({
          title: title || "New Card",
          description: description || "Enter a description here",
          list: listId,
          activities: [],
          members: ["5fa0155b23849425c8ff2576"]
        });
      })
      .then(result => {
        newCard = result;
        return List.findByIdAndUpdate(listId, {
          $addToSet: { cards: result.id }
        });
      })
      .then(() => Card.findById(newCard.id).populate("members"))
      .then(result => {
        res.json({
          message: apiMessages.successfulPost,
          data: result
        });
      })
      .catch(error => next(error));
  },
  updateCard: async (req, res, next) => {
    const cardId = req.params.id;
    const { title, description } = req.body;
    let originalCard;

    Card.findById(cardId)
      .populate({
        path: "list",
        populate: {
          path: "board"
        }
      })
      .then(card => {
        if (!card) {
          throw new Error(apiMessages.doesNotExist("Card"));
        }

        let canCurrentUserDelete = checkUserBoardPermissions(
          card.list.board,
          req.user.id
        );
        if (!canCurrentUserDelete) {
          throw new Error(apiMessages.failedAuth);
        }
        originalCard = card;
        let activityMessage = parseCardChange(title, description);
        return Activity.create({
          description: activityMessage,
          card: cardId
        });
      })
      .then(activity => {
        return Card.findByIdAndUpdate(
          cardId,
          {
            title: title || originalCard.title,
            description: description || originalCard.description,
            $push: { activities: activity.id }
          },
          { new: true }
        ).populate(["activities", "members"]);
      })
      .then(result => {
        res.json({
          message: apiMessages.successfulPut,
          data: result
        });
      })
      .catch(error => next(error));
  },
  addMemberToCard: async (req, res, next) => {
    const cardId = req.params.id;
    const userToAdd = req.params.userId;
    let board;
    let updatedCard;

    Card.findById(cardId)
      .populate({
        path: "list",
        populate: {
          path: "board"
        }
      })
      .then(card => {
        if (!card) {
          throw new Error(apiMessages.doesNotExist("Card"));
        }

        let canCurrentUserDelete = checkUserBoardPermissions(
          card.list.board,
          req.user.id
        );
        if (!canCurrentUserDelete) {
          throw new Error(apiMessages.failedAuth);
        }

        board = card.list.board;
        return Card.findByIdAndUpdate(
          cardId,
          {
            $addToSet: { members: userToAdd }
          },
          { new: true }
        ).populate(["activities", "members"]);
      })
      .then(result => {
        updatedCard = result;
        return Board.findByIdAndUpdate(board.id, {
          $addToSet: { users: userToAdd }
        });
      })
      .then(result => {
        return User.findByIdAndUpdate(userToAdd, {
          $addToSet: { boards: board.id }
        });
      })
      .then(result => {
        res.json({
          message: apiMessages.successfulPost,
          data: updatedCard
        });
      })
      .catch(error => next(error));
  },
  removeMemberFromCard: async (req, res, next) => {
    const cardId = req.params.id;
    const userToRemove = req.params.userId;
    let board;
    let updatedCard;

    Card.findById(cardId)
      .populate({
        path: "list",
        populate: {
          path: "board"
        }
      })
      .then(card => {
        if (!card) {
          throw new Error(apiMessages.doesNotExist("Card"));
        }

        let canCurrentUserDelete = checkUserBoardPermissions(
          card.list.board,
          req.user.id
        );
        if (!canCurrentUserDelete) {
          throw new Error(apiMessages.failedAuth);
        }

        board = card.list.board;
        return Card.findByIdAndUpdate(
          cardId,
          {
            $pull: { members: userToRemove }
          },
          { new: true }
        ).populate(["activities", "members"]);
      })
      .then(result => {
        res.json({
          message: apiMessages.successfulDelete,
          data: result
        });
      })
      .catch(error => next(error));
  },
  deleteCard: async (req, res, next) => {
    const cardId = req.params.id;
    let deletedCard;

    Card.findById(cardId)
      .populate({
        path: "list",
        populate: {
          path: "board"
        }
      })
      .then(card => {
        if (!card) {
          throw new Error(apiMessages.doesNotExist("Card"));
        }

        let canCurrentUserDelete = checkUserBoardPermissions(
          card.list.board,
          req.user.id
        );
        if (!canCurrentUserDelete) {
          throw new Error(apiMessages.failedAuth);
        }

        return Card.findByIdAndRemove(cardId);
      })
      .then(result => {
        deletedCard = result;
        return List.update(
          { cards: { $in: [deletedCard.id] } },
          {
            $pop: { cards: deletedCard }
          }
        );
      })
      .then(() => {
        res.json({
          message: apiMessages.successfulDelete,
          data: {
            deletedResource: deletedCard
          }
        });
      })
      .catch(error => next(error));
  }
}