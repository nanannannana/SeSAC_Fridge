const { fresh } = require("../../model");
const { frozen } = require("../../model");
const { recipe } = require("../../model");

// 선택한 식재료로 레시피 찾기
exports.postResultRecipe = async (req, res) => {
  console.log("req.body.checkedIngdList : ", req.body.checkedIngdList);
  console.log(req.body.checkedIngdList[0]);
  // let result = await recipe.findAndCountAll({
  //     where : {
  //         recipe_ingd :  {
  //         },
  //     },
  // })
  console.log("postResultRecipe result : ", result);
  res.send(true);
};

exports.deleteDeleteInFresh = async (req, res) => {
  // fresh 테이블에서 삭제
  let result = await fresh.destroy({
    where: {
      user_user_id: req.session.user,
      fresh_name: req.body.name,
    },
  });
  res.send(true);
};
exports.deleteDeleteInFrozen = async (req, res) => {
  // frozen 테이블에서 삭제
  let result = await frozen.destroy({
    where: {
      user_user_id: req.session.user,
      frozen_name: req.body.name,
    },
  });
  res.send(true);
};
