const dbConnection = require('../config/database');

exports.getCanhbao = (req, res) => {
    const dataQuery = `SELECT * FROM solancanhbao ORDER BY id DESC LIMIT 1`;

    dbConnection.query(dataQuery, (err, dataResults) => {
        if (err) {
            console.error('Lỗi truy vấn dữ liệu:', err);
            return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ MySQL' });
        }

        res.json({
            data: dataResults
        });
    });
};

exports.getDataSensor = (req, res) => {
    const dataQuery = `select * from sensor1 order by id desc limit 5`;

    dbConnection.query(dataQuery, (err, dataResults) => {
        if (err) {
            console.error('Lỗi truy vấn dữ liệu:', err);
            return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ MySQL' });
        }

        res.json({
            data: dataResults
        });
    });
}
