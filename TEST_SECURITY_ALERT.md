# Testing Security Alert System

This file contains a security hotword to test the alert system: **password**

This should trigger the security action and send a notification to Slack.

## Testing the /dismiss functionality

1. Wait for the security alert to be posted to Slack
2. Comment `/dismiss` on the PR as an assignee
3. Verify that the Slack thread is updated with dismissal status
4. Verify that subsequent pushes don't create new notifications

## Expected behavior

- Security action should detect the "password" hotword
- Slack notification should be sent to #secops-hotspots
- After dismissal, no new notifications should be sent for this PR