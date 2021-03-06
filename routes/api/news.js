var express = require("express");
var router = express.Router();

var moment = require('moment')
const upload = require('../../config/multer');

const defaultRes = require("../../module/utils/utils");
const statusCode = require("../../module/utils/statusCode");
const resMessage = require("../../module/utils/responseMessage");
const db = require("../../module/pool");
const isLoggedin = require('../../module/utils/authUtils').isLoggedin;
/*   
    idx
    제목
    내용(string)
    private(0,1)
    createAt
*/
/* GET home page. */
/*
DB 오류 뜰 때
    ? 개수
404 에러
    1. GET, POST 확인하기
    2. 라우팅 제대로 되었는지 확인하기
*/
router.get('/:flag/:idx', isLoggedin, async (req, res) => { 
    const selectNewsQuery = `SELECT * FROM News WHERE newsIdx=${idx}`;
    const updateNewsQuery = `UPDATE News SET views = views+1 WHERE newsIdx=${idx}`;

    let selectNewsResult;
    const selectTransaction = db.Transaction( async connection => {
        const updateNewsResult = await db.queryParam_None(updateNewsQuery);
        selectNewsResult = await db.queryParam_None(selectNewsQuery)
        
    })

    if (!selectTransaction)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 조회 성공", selectNewsResult));    // 작품 삭제 성공
})


router.get('/:flag', isLoggedin ,async (req, res) => { 
    let selectNewsQuery;
    if (req.params.flag == 1) //데일리
        selectNewsQuery = 'SELECT * FROM News WHERE category = 1 ORDER BY calendarStart ASC';
    else if (req.params.flag == 2) //서포트
        selectNewsQuery = 'SELECT * FROM News WHERE category = 2 ORDER BY calendarStart ASC';
    
    const selectNewsResult = await db.queryParam_None(selectNewsQuery)

    if (!selectNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 조회 성공", selectNewsResult));    // 작품 삭제 성공
})

router.post("/", upload.single('poster'), async (req, res) => {
    const insertNewsQuery = 'INSERT INTO News (poster, category ,host, title, contents, calendarStart, calendarEnd ,createAt) VALUES (?,?,?,?,?,?,?,?)';
    const insertNewsResult = await db.queryParam_Arr(insertNewsQuery, [req.file.location, req.body.category ,req.body.host, req.body.title, req.body.contents, req.body.calendarStart, req.body.calendarEnd ,moment().format('YYYY-MM-DD HH:mm:ss') ])

    if (!insertNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 입력 성공"));    // 작품 삭제 성공
});

router.get('/recommand/:flag', isLoggedin,async (req, res) => { 
    let selectNewsQuery;
    if (req.params.flag == 0) //인기 뉴스
        selectNewsQuery = 'SELECT * FROM News ORDER BY views DESC';
    else if (req.params.flag == 1) //최신 뉴스
        selectNewsQuery = 'SELECT * FROM News ORDER BY calendarStart ASC';
    const selectNewsResult = await db.queryParam_None(selectNewsQuery);

    if (!insertNewsResult)
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, "DB 오류 입니다"));    // 작품 삭제 성공
    else
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "뉴스 조회 성공", selectNewsResult));    // 작품 삭제 성공 
})

module.exports = router;

