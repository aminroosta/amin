
let { AsyncResource, executionAsyncId } = require('node:async_hooks');

let asyncResource = new AsyncResource(
  'ExampleAsyncResource', {
  triggerAsyncId: executionAsyncId(),
  requireManualDestroy: false
});

asyncResource.runInAsyncScope(() => {
  let id1 = executionAsyncId();
  setInterval(() => {
    let id2 = executionAsyncId();
    console.log(new Date(), id1, id2);
  }, 1000);
}, null, 1, 2, 3);
console.log('after');

// Call AsyncHooks destroy callbacks.
asyncResource.emitDestroy();

// Return the unique ID assigned to the AsyncResource instance.
asyncResource.asyncId();

// Return the trigger ID for the AsyncResource instance.
asyncResource.triggerAsyncId();
