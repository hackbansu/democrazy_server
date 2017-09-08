const mysql = require('mysql');

const dbPoolConf = {
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
};
const pool = mysql.createPool(dbPoolConf);

pool.on('acquire', function (connection) {
    // console.log('Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment=1')
});

pool.on('enqueue', function () {
    console.log('Waiting for available connections slot');
})

pool.on('release', function (connection) {
    // console.log('Connection %d released', connection.threadId);
});

//exporting pool
module.exports.pool = pool;

function addWhereClause(sql, identity) {
    sql += "WHERE ";
    let k = 0;
    for (let i in identity) {
        if (k !== 0) {
            sql += "and ";
        } else {
            k++;
        }

        //need 'IS' for null values otherwise '='
        let operator = identity[i] || identity[i] === 0 ? " = " : " IS ";
        sql += mysql.escapeId(i) + operator + mysql.escape(identity[i]) + " ";
    }

    return sql;
}

module.exports.addWhereClause = addWhereClause;


//exporting things
module.exports = {
    bills_ordinances_table: require('./jsFiles/bills_ordinances_table'),
    opinion_polls_table: require('./jsFiles/opinion_polls_table'),
    users_table: require('./jsFiles/users_table'),
    states_table: require('./jsFiles/states_table'),
    localities_table: require('./jsFiles/localities_table'),
    temp_users_table: require('./jsFiles/temp_users_table'),
    users_opted_states_for_bills_table: require('./jsFiles/users_opted_states_for_bills_table'),
    bills_ordinances_votes_table: require('./jsFiles/bills_ordinances_votes_table'),
    opinion_polls_votes_table: require('./jsFiles/opinion_polls_votes_table'),
    bill_ordinance_question_table: require('./jsFiles/bill_ordinance_question_table'),
};
