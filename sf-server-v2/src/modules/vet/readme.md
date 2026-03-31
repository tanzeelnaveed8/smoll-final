# Vet Flow ( Instant Call )

NOTE: websocket equals realtime event.

- Member selects online vet.
- We send vet a call request ( websocket on vetsuit )
- Vet accepts the call
- Member lands on create case screen
- Member submits, Vet receive the websocket and clicks on the case
- Member waits in the waiting area.
- Vet starts the call or rejects the case
- If rejected, user lands on find another vet screen.
- Member clicks on find another and lands on the vets screen with online status
- Same flow, but now instead of re-adding the case.
- We show the user already existing case.
- Member send that case to the Vet.
- This time Vet accepted the case and calls back the user
- Call ends, user lands on the feedback screen.
- Member submits feedback and the case is closed.
- If vet escalates the case, we send the case to the partners
- And call ends, user lands on feedback screen.
- We notify user that we have sent the case to partners
- Partners give back a quote for this case
- Member selects the partner and pay some for the case.
- Member visits the partner.