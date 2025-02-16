const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Report = require("./../models/reportModel");
const User = require("./../models/userModel");

exports.getAllReports = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role !== "admin") {
    return next(
      new AppError("You are not authorized to view user reports", 403)
    );
  }

  const reports = await Report.find().populate("reporter", "name handle");

  const groupedReports = reports.reduce((acc, report) => {
    const key = JSON.stringify(report.reportedEntity);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(report);
    return acc;
  }, {});

  const sortedGroups = Object.values(groupedReports).sort(
    (a, b) => b.length - a.length
  );

  const sortedReports = sortedGroups.flat();

  res.status(200).json({
    status: "success",
    message: "Reports retrieved",
    data: sortedReports,
  });
});

exports.createReport = catchAsync(async (req, res, next) => {
  const { description, reportedEntity } = req.body;

  const alreadyReported = await checkExistingReport(
    req.user._id,
    reportedEntity
  );

  if (alreadyReported) {
    return next(new AppError("You have already sent a report", 400));
  }

  const newReport = await Report.create({
    reporter: req.user._id,
    description,
    reportedEntity,
  });

  res.status(200).json({
    status: "success",
    message: "Report has been created",
    data: newReport,
  });
});

exports.deleteReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError("Report not found", 404));
  }

  const user = await User.findById(req.user._id);

  if (user.role !== "admin") {
    return next(
      new AppError("You are not authorized to delete this report", 403)
    );
  }

  await Report.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Report deleted successfully",
  });
});

const checkExistingReport = async (reporter, reportedEntity) => {
  const query = {
    reporter,
  };

  if (reportedEntity.postId) {
    query["reportedEntity.postId"] = reportedEntity.postId;
  }

  if (reportedEntity.commentId) {
    query["reportedEntity.commentId"] = reportedEntity.commentId;
  }

  if (reportedEntity.replyId) {
    query["reportedEntity.replyId"] = reportedEntity.replyId;
  }

  if (reportedEntity.spotId) {
    query["reportedEntity.spotId"] = reportedEntity.spotId;
  }

  if (reportedEntity.insightId) {
    query["reportedEntity.insightId"] = reportedEntity.insightId;
  }

  const existingReport = await Report.findOne(query);
  return existingReport !== null;
};
