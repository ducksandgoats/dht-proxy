const debug = true

export default function () {
  const proxy = {};
  // trystero tracker
  proxy.trystero_room = {};
  // initialize to receive back the proxy object for a specific configuration
  proxy.initialize = function (conf, ns, joinRoom) {

    //Trystero Module Settings
    proxy.trystero_room = joinRoom(conf, ns)
    proxy.trystero_room.onPeerJoin(id => console.log(`Trystero ID: ${id} joined`))
    proxy.trystero_room.onPeerLeave(id => console.log(`Trystero ID: ${id} left`))
    const [sendMsg, onMsg] = proxy.trystero_room.makeAction('gun-protocol')
    onMsg(proxy.receiver)
    proxy.addSender(sendMsg)

    // WebSocketProxy definition

    return function (url) {
      const websocketproxy = {};

      websocketproxy.url = url || 'ws:proxy';
      proxy.proxyurl = url || 'ws:proxy';
      websocketproxy.CONNECTING = 0;
      websocketproxy.OPEN = 1;
      websocketproxy.CLOSING = 2;
      websocketproxy.CLOSED = 3;
      websocketproxy.readyState = 1;
      websocketproxy.bufferedAmount = 0;
      websocketproxy.onopen = function () {};
      websocketproxy.onerror = function () {};
      websocketproxy.onclose = function () {};
      websocketproxy.extensions = '';
      websocketproxy.protocol = '';
      websocketproxy.close = {code:'4', reason:'Closed'};
      websocketproxy.onmessage = function(){}; //overwritten by gun
      websocketproxy.binaryType = 'blob';
      websocketproxy.send = proxy.sender;

      return websocketproxy
    }
  };

  proxy.listeners = [];

  proxy.addListener = function (listener) {
    proxy.listeners.push(listener)
  };

  proxy.receiver = function (data) {
    if(debug)console.log('----------> Receiver')
    if(debug)console.log(data)

    proxy.listeners.forEach((fn, i) => {
      fn(data)
    });

  };

  proxy.senders = [];

  proxy.addSender = function (sender) {
    proxy.senders.push(sender)
  };

  proxy.sender = function (msg) {
    if(debug)console.log('<---------- Sender')
    if(debug)console.log(msg)
    proxy.senders.forEach((fn, i) => {
      if(debug)console.log(fn)
      fn(msg)
    });

  }

  proxy.attachGun= function (gun) {
    proxy.addListener(gun._.opt.peers[proxy.proxyurl].wire.onmessage)
  }

  proxy.shutdown = function () {
    proxy.trystero_room.leave()
  };

  return proxy
}
