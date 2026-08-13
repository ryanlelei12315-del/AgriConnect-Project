module.exports = {
  renderAsk: (req, res) => {
    res.render('advisory/ask', { user: req.user });
  },
  renderAnswers: (req, res) => {
    // Show recent Q&A from an expert
    res.render('advisory/answers', { user: req.user });
  },
};
