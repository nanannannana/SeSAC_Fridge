const { fresh } = require("../../model");
const { frozen } = require("../../model");
const { recipe } = require("../../model");
const { user } = require("../../model");
const { Op } = require("sequelize");

//global variable
//로그인 시각 기준으로 시간 set
    let today = new Date();
   
    let exp_date = new Date(); 
    exp_date.setHours(23,59,59);
    // console.log("exp_date : ",exp_date);

    let date = new Date(); //date : 이틀 후
    date.setDate( date.getDate()+2 ); 
    // console.log( "date: ",  date );

// 메인 페이지 렌더 - 영은
exports.getMain = async (req,res) => {
    // 로그인 한 경우,  
    if(req.session.user){ 
        // 임박 식재료 개수
        let fresh_count = await fresh.findAndCountAll({
            where: {
                fresh_expire : {
                    [Op.gte] : today,
                    [Op.lte] : date
                },
                user_user_id : req.session.user                
            },
        })

        // 유통기한 지난 식재료 개수 & list
        let exp_list = await fresh.findAndCountAll({
            where : {
                fresh_expire : {
                    [Op.lt] : exp_date
                },
                user_user_id : req.session.user
            }
        })
        // console.log("log fresh_count :", fresh_count.count );
        // console.log("log exp_list :", exp_list.rows );

        //로그인한 경우 session에서 user name
        // & cookie 에서 EXP_MODAL value 확인

        // user name
        let user_name = await user.findOne({
            attributes : ["user_name"],
            where : {user_id : req.session.user}
        });
        console.log("log user_name : ", user_name.user_name );  
        if(req.cookies.user_id=="1" && req.cookies.EXP_MODAL==1) { //자동로그인 o & 모달 오늘안봄 O
            res.render("main/main", {
                is_remember_me: true,
                isLogin : true, 
                fresh_count : fresh_count.count,
                exp_count : exp_list.count,
                user_name : user_name.user_name,
                exp_modal : true 
            }); 
        } else if (req.cookies.user_id!=="1" && req.cookies.EXP_MODAL==1) { // 자동로그인 x & 모달 오늘안봄 o
            res.render("main/main", {
                is_remember_me: false,
                isLogin : true, 
                fresh_count : fresh_count.count,
                exp_count : exp_list.count,
                user_name : user_name.user_name,
                exp_modal : true 
            }); 
        } else if (req.cookies.user_id=="1" && req.cookies.EXP_MODAL!==1) { //자동로그인 o & 모달 오늘 안봄x
            res.render("main/main",{ //로그인 O & 모달 오늘안봄 X
                is_remember_me:true,
                isLogin : true, 
                fresh_count : fresh_count.count,
                exp_count : exp_list.count,
                user_name : user_name.user_name,
                exp_modal : false
            })
        } else { //자동로그인 x & 모달 오늘 안봄x
            res.render("main/main",{ //로그인 O & 모달 오늘안봄 X
                is_remember_me:false,
                isLogin : true, 
                fresh_count : fresh_count.count,
                exp_count : exp_list.count,
                user_name : user_name.user_name,
                exp_modal : false
            })
        }
    } else { 
        res.render("main/main", { //로그인 X
            is_remember_me: false,
            isLogin : false, 
            fresh_count : false,
            exp_count : false,
            user_name : false,
            exp_modal : false
        });  
    }
}

// 식재료 삭제 알림 modal cookie 생성
exports.postModalCookie = (req, res) => {
    res.cookie("EXP_MODAL","1", {
        httpOnly : true,
        expires : exp_date,
    });
    res.send(true);
}


