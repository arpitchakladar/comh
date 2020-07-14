export default (state = null, actions) => {
  switch (actions.type) {
    case 'SET-WHATSNEWS':
      return actions.whatsNews;

    default:
      return state;
  }
};
