const express = require('express');
const router = express.Router();
const MetaApi = require('metaapi.cloud-sdk').default;
const bodyParser= require('body-parser');
const db = require('./../database/mongodb');
const mtdb = db.client.db("TradingData").collection("TradingOrders");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

let trading = false
if (trading){
  const apiToken = "????"
  const mtPassword = '????'
  const brokerServer = '????'
  const accountName = "????"
  const serviceName = "????"
  const endpointPassword = "????"
  const asset = "????"
  const DBusername = "????";
  const DBpassword = "????";
  const databaseName = "If no match, given name will create new."
  const collectionName = "If no match, given name will create new."
  
  // RECOMMENDATIONS
  // Do not use timers below 15 seconds on RPC or Websocket calls, you'll over spend credits also causing API server overload.
    
  // FIlter used in Database calls
  const filter = { "service": `${serviceName}` };
  
  const MetaApi = require('metaapi.cloud-sdk').default;
  
  const api = new MetaApi(apiToken);
  
  let accounts;
  let account;
  let connection;
  let connectionS;
  let terminalState;
  
  // Connects via RPC for order creation, but using websocket stream for asset price fetch.
  async function traderLogin() {
    try {
      accounts = await api.metatraderAccountApi.getAccounts();
      account = accounts.find(a => a.login === mtLogin && a.type.startsWith('cloud'));
      
      if (!account) {
        console.log('Adding MT4 account to MetaApi');
        account = await api.metatraderAccountApi.createAccount({
          name: 'Test account',
          type: 'cloud',
          login: mtLogin,
          password: mtPassword,
          server: brokerServer,
          platform: 'mt4',
          magic: 1000
        });
      } else {
        console.log('MT4 account already added to MetaApi');
      }
  
      await account.deploy();
      await account.waitConnected();
  
      connection = account.getRPCConnection();
      await connection.connect();
      await connection.waitSynchronized();
  
      connectionS = account.getStreamingConnection();
      await connectionS.connect();
  
      await connectionS.waitSynchronized();
      
      await connectionS.subscribeToMarketData(`${asset}`);
      
      terminalState = connectionS.terminalState;
      console.log(`(Trading live,  ${accountName} Logged and ready.`);
  
      // Requires Database function implementation
      setTimeout(startNew, 10000);
      
    } catch (error) {
      if(error.details) {
        if(error.details === 'E_SRV_NOT_FOUND') {
          console.error(error);
        } else if (error.details === 'E_AUTH') {
          console.log(error, `\n ${accountName} encountered an error.`);;
        } else if (error.details === 'E_SERVER_TIMEZONE') {
          console.log(error, `\n ${accountName} encountered an error.`);;
        }
      }
      console.error(error);
    }
  
  }traderLogin();
  
  async function startNew(){
    let y = []
  
    try{
      y = await terminalState.positions
    }catch(error){
      console.log("Error on Y startNew(): ", error)
      await traderLogin()
      y = await terminalState.positions
    }
    
    try{
      await mtdb.remove({});
      console.log("Collection cleaned.");
    }catch(error){
      console.log(error)
    }
  
    let base = {
      "service": `${serviceName}`,
      tp1: [],
      tp2: [],
      tp3: [],
      orders: []
    }
  
    await mtdb.insertOne(base);
  
    if(y.length > 0){
      for(let i = 0;i<y.length;i++){
  
        let orderIdReal = y[i].id;
        let type = y[i].type;
        let price = y[i].openPrice;
  
        let typeTranslated = "";
        if (type === "POSITION_TYPE_BUY"){
          typeTranslated = "BUY"
        }else if(type === "POSITION_TYPE_SELL"){
          typeTranslated = "SELL"
        }
  
        let order = `${orderIdReal}`+":"+`${typeTranslated}`+':'+`${price}`;
        await mtdb.updateOne(filter, { $push: { orders: order }});
      }
      console.log("Database updated.")
    }else{
      console.log(`${accountName} No open orders on database start.`)
    }
    console.log(`(${accountName} Database ready.`)
  
  }
  
  async function getData(){
    let result = await mtdb.findOne(filter);
  
    if(result){
      let orders = result.orders;
  
      console.log("\n")
      console.log(`${accountName} report: `)
      console.log(orders);
      console.log("\n")
    
      return orders
    }else{
      let dummyArr = []
      return dummyArr
    }
  
  }setTimeout(getData, 60000)
  
  async function getLiveOrders(){
    let result = await mtdb.findOne(filter);
    
    if(result){
      let orders = result.orders;
  
      return orders
    }else{
      let dummyArr = []
      return dummyArr
    }
  }
  
  async function checkPrice(){
    let result = 0
  
    try{
      result = await terminalState.price(`${asset}`);
  
      let price = (result.ask + result.bid / 2).toFixed(2);
      return price;
    }catch(error){
      await reconnect()
      result = await terminalState.price(`${asset}`);
      
      let price = (result.ask + result.bid / 2).toFixed(2);
      return price;
    }
  }
  
  async function modifyPos(orderIdReal, side, trail, place){
  
    let orders = await getLiveOrders()
  
    if(orders.length > 0){
      for(let i=0;i<orders.length;i++){
        if (orders[i].includes(orderIdReal)){
          const update = {
            $pull: {
              orders: {
                $regex: `^${orderIdReal}:`
              }
            }
          };
      
          await mtdb.updateOne(filter, update);
        }
      }
    }
  
    try{
      connection.modifyPosition(orderIdReal, trail, 0);
      let order = `${orderIdReal}`+":"+`${side}`+':'+`${trail}`+`:${place}`;
      await mtdb.updateOne(filter, { $push: { orders: order }});
      console.log("Order modified & DB updated.")
    }catch(error){
      console.log(`${accountName}: Error caught in ${place} with side ${side}: `, error)
    }  
  }
  
  async function updateDatabase(){
  
    let y = []
  
    try{
      y = await terminalState.positions
    }catch(error){
      await reconnect()
      y = await terminalState.positions
    }
    
    let orders = await getData();
      
    for (let i = 0; i < y.length; i++) {
      let orderToCheck = y[i].id;
      let type = y[i].type;
      let found = false;
    
      for (let j = 0; j < orders.length; j++) {
        let order = orders[j].split(':')[0];
    
        if (orderToCheck === order) {
          found = true;
          break;
        }
      }
  
      if(type === "POSITION_TYPE_SELL"){
        side = "SELL"
      }else{
        side = "BUY"
      }
    
      if (!found) {
        let orderToPush = `${orderToCheck}:${side}:${y[i].openPrice}`
        await mtdb.updateOne(filter, { $push: { orders: orderToPush }});
      }
    }
  }setInterval(updateDatabase, 15000)
  
  async function confirmOrderLive(){
  
    let y = []
    
    try{
      y = await terminalState.positions
    }catch(error){
      await reconnect()
      y = await terminalState.positions
    }
    
    let orders = await getLiveOrders();
      
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i].split(':')[0];
      let found = false;
    
      for (let j = 0; j < y.length; j++) {
        let orderToCheck = y[j].id;
    
        if (order === orderToCheck) {
          found = true;
          break;
        }
      }
    
      if (!found) {
        const update = {
          $pull: {
            orders: {
              $regex: `^${order}:`
            }
          }
        };
      
        await mtdb.updateOne(filter, update);
      }
    }
  }setInterval(confirmOrderLive, 15000)
  
  // Used in instances where login expires
  async function reconnect(){
    try{
      await connection.connect();
      console.log("test2- Reconnected.")
      return
    }catch(error){
      console.log("Error retrying connection.")
      await traderLogin()
      return
    }
  }
  
  // This can be used if you want to make sure connection doesnt expire, but overall redundant
  //setInterval(reconnect, 300000)
  
  async function openPosition(side, sl){
  
    let orderSize = 1;
    let tp = 0;
  
    if (side === "BUY"){
      try{
        connection.createMarketBuyOrder(`${asset}`, orderSize, sl, tp, {
            comment: 'comm'
        });
      }catch(error){
        console.log(error, "\n test2 encountered an error.");
      }
    }else if(side === "SELL"){
      try{
        connection.createMarketSellOrder(`${asset}`, orderSize, sl, tp, {
          comment: 'comm'
        });
      }catch(error){
        console.log(error, "\n test2 encountered an error.");
      }
    }
  }
  
  async function closeOrder(orderId){
    try{
      connection.closePosition(orderId);
      removeClosed(orderId)
    }catch(error){
      console.log(error, "\n test2 encountered an error.");
    }
  }
  
  async function closeOppositeOrder(side){
    
    let liveOrders = await getLiveOrders()
  
    if (liveOrders.length > 0){
      for(let i=0;i<liveOrders.length;i++){
        let orderIdToClose = liveOrders[i].split(':')[0]
        let oldSide = liveOrders[i].split(':')[1]
        
        if(side === "BUY"){
          if(oldSide === "SELL"){
            closeOrder(orderIdToClose)
          }
        }else if(side === "SELL"){
          if(oldSide === "BUY"){
            closeOrder(orderIdToClose)
          }
        }              
      }
    }
  }
  
  router.post(`/metatrader/webhook/${accountName}/exit/:side/:pw`, async (req, res) => {
    let pw = req.params.pw;
    let sid = req.params.side;
    let side = sid.toUpperCase();
    
    let hasOrders = false;
    if(pw === endpointPassword){
      if (side === "BUY" || side === "SELL") {
        let result = await mtdb.findOne(filter);
        let orders = result.orders; 
        for(let i =0;i < orders.length; i++){
          let orderToClose = orders[i];
    
          if (orderToClose){
            hasOrders = true;
            let orderIdToClose = orders[i].split(':')[0]
            let sideToClose = orders[i].split(':')[1]
            
            if (side === sideToClose){
              if (orderIdToClose) {
    
                try{
                  closeOrder(orderIdToClose);
                  console.log("Order closed: ", orderIdToClose)
                  removeClosed(orderIdToClose);
                }catch(error){
                  console.log(error, "\n test2 encountered an error.");
                }
              } else {
                console.log(`No ${side} order to close.`);
              }
            }else{
              console.log(`No ${side} orders to close.`)
            }
          }
        }
    
        orders = [];
        info = [];
      
        if(hasOrders){
            let resp = 'Orders closed.';
          return res.status(200).json({ 'success': resp });
        }else{
            let resp = 'No orders to close.';
          return res.status(200).json({ 'success': resp });
        }
      }
    }else{
      let resp = 'You shouldn\'t be doing that, should you?';
      return res.status(400).json({ 'error': resp });
    }
  });
  
  router.post(`/metatrader/webhook/${accountName}/entry/:side/:pw`, async (req, res) => {
    let sl = 0
    let sid = req.params.side;
    let side = sid.toUpperCase();
    let pw = req.params.pw;
  
    const now = new Date();
    const hour = now.getUTCHours();
  
  
    if (/*This if can be used to limit server working hours*/hour === 25) {
      console.log("Strategy not running during low volatility hours.")
      return res.status(200).json({ 'offline': "Strategy out of hours." });  
    }else{
      if(pw === endpointPassword){
        if (side === "BUY" || side === "SELL") {
            
          // Revert boolean in case strategy requires open swing
          let closeOppositeSide = true
          if (closeOppositeSide){
            if(side === "BUY"){
              closeOppositeOrder(side)
            }else if(side === "SELL"){
              closeOppositeOrder(side)
            }
          }
  
          // You can remove SL on entry for faster entries
          let setSL = true
          if (setSL){
            if(side === "BUY"){
              let price = await checkPrice()
              sl = Number(price) - 1
            }else{
              let price = await checkPrice()
              sl = Number(price) + 1
            }
          }
  
          openPosition(side, sl);
          
          let resp = (side) + ' order created.';
          return res.status(200).json({ 'success': resp });
        }else{
          return res.status(400).json({ 'error': 'Invalid side.' });
        }
      }else{
        let resp = 'You shouldn\'t be doing that, should you?';
        return res.status(400).json({ 'error': resp });
      }
    }
  });
  
  // Removes closed orders from database
  async function removeClosed(order){
    const update = {
      $pull: {
        orders: {
          $regex: `^${order}:`
        }
      }
    };
  
    await mtdb.updateOne(filter, update);
    console.log("Order removed: ", order)
  }
  
  // On a European server there is a two hours delay.. where UTC+2 trading stops at 23:00, hour === 21 is used to prevent function from executing while market is closed.
  async function trailPrice(){
  
    const now = new Date();
    const hour = now.getUTCHours();
    
    if (hour === 21) {
        console.log("Market closed.")
        return
    }else{
        
      console.log("Checking live orders..")
      let y = await connection.getPositions()
  
      if(y.length === 0){
        console.log("(TEST2) No live orders.")
        return
      }
    
      let orders = await getLiveOrders()
      let price = await checkPrice()
      
      if(orders.length > 0){
        for(let a = 0; a<orders.length;a++){
          if(y.length > 0){
            for(let i = 0; i<y.length; i++){
              let orderIdReal = y[i].id;
              let type = y[i].type;
  
              let orderDB = orders[a].split(':')[0]
              if (orderIdReal === orderDB) {
                stage = orders[a].split(':')[3]
                if (type === "POSITION_TYPE_SELL"){
                  side = "SELL"
                  lastPrice = orders[a].split(':')[2]
                  if (y[i].profit > 100 && price < lastPrice){ 
                    let trail = 0;
                    trail = price + 2;
                
                    let place = `${accountName}, SELL stage-1`;
                    modifyPos(orderIdReal, side, trail, place)
                  }else{
                    console.log("Order not modified.")
                  }
                }else if(type === "POSITION_TYPE_BUY"){
                  side = "BUY"
                  lastPrice = orders[a].split(':')[2]
                  if (y[i].profit > 100 && price > lastPrice){ 
                    let trail = 0;
                    trail = price - 2;
                
                    let place = `${accountName}, BUY stage-1`;
                    modifyPos(orderIdReal, side, trail, place)
                  }else{
                    console.log("Order not modified.")
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  // As per recommended, do not use a timer under 15 seconds to avoid API server overload
  setInterval(trailPrice, 20000);
}

module.exports = function tradingRoutes(req, res, next) {
	router(req, res, next)
}
