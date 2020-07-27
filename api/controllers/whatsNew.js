const WhatsNew = require('../models/WhatsNew');

exports.addWhatsNew = async (req, res, next) => {
  if (!req.body.password) {
    res.status(401);
    return next({ message: 'Password is required', statusCode: 401 });
  }

  if (!req.body.description) {
    res.status(400);
    return next({ message: 'Description is required', statusCode: 400 });
  }

  if (process.env.ADMIN_PASSWORD !== req.body.password) {
    res.status(401);
    return next({ message: 'Password dosen\'t match', statusCode: 401 });
  }

  await WhatsNew.create({ description: req.body.description });

  return res.json({ message: 'Successfully added whats new' });
};

exports.getWhatsNew = async (req, res) => res.json({ whatsnew: (await WhatsNew.find({}, {}, { sort: { createdAt: 1 } })) });
