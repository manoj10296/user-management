const checkUserBoardPermissions = (board, user) => {
  let allUsers = board.users.map(user => user.toString());
  return allUsers.includes(user);
};

const apiMessages = {
  successfulPost: "Resource successfully created.",
  successfulPut: "Resource successfully updated.",
  successfulDelete: "Resource successfully removed.",
  failedAuth: "You are not authorized to modify or remove this resource.",
  doesNotExist: resouce => `${resource} does not exist.`
};

const parseCardChange = (title, description) => {
  let message;
  if (!title && description) {
    message = `Changed description to "${description}".`;
  } else if (title && !description) {
    message = `Changed title to "${title}".`;
  } else if (title && description) {
    message = `Changed title to "${title}" and description to "${description}".`;
  }

  return message;
};


module.exports = {
  checkUserBoardPermissions,
  parseCardChange,
  apiMessages
}