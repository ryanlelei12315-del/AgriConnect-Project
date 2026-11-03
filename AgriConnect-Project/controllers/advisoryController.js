module.exports = {
  renderAsk: (req, res) => {
    res.render('advisory/ask', { user: req.user });
  },
};
