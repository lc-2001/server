const path = require('path')
const fileUtils = require('../utils/file_utils')
const WebSocket = require('ws')
//创建WebSocket服务器端的对象，绑定的端口为9998
const wss = new WebSocket.Server({
    port: 9998
})
module.exports.listen = () => {
    //对客户端的连接事件进行监听
    //client:代表的是客户端的连接socket对象
    wss.on('connection', client => {
        //对客户端的连接对象message事件进行监听
        //msg:有客户端发给服务器端的数据
        client.on('message', async msg => {
            let payload = JSON.parse(msg)
            const action = payload.action
            if (action === 'getData') {
                let filePath = '../data/' + payload.chartName + '.json'
                filePath = path.join(__dirname, filePath)
                const ret = await fileUtils.getFileJsonData(filePath)
                //需要在服务器端获取到数据的基础上，增加一个data的字段
                //data所对应的值，就是某个json文件的内容
                payload.data = ret
                client.send(JSON.stringify(payload))
            }
            else {
                //需要原封不动将所接收到的数据转发给每一个属于连接状态的客户端
                // wss.clients 所有客户端的连接
                wss.clients.forEach(client => {
                    client.send(msg)
                })
            }
            //由服务端发给客户端的数据
            // cliient.send('')
        })
    })
}