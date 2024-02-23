process.on('message', (msg: any) => {
  if (msg.key === 'ping') return ping(msg);

  console.log({ msg });
});

function ping(_msg: any) {
  process.send!({ key: 'pong', value: '' });
};

