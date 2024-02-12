# Eram

Telemetry:
  * `{"module": "eram", "event": "job", "action": "start"}` — at the point a job is fetched from the database and will execute
  * `{"module": "eram", "event": "job", "action": "stop"}` — after a job succeeds and the success is recorded in the database
  * `{"module": "eram", "event": "job", "action": "exception"}` — after a job fails and the failure is recorded in the database
  * `{"module": "eram", "event": "worker", "action": "init"}` - when the Eram worker is started this will execute
