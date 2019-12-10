Team Plans Widget
=================

Team plans widget. Create new teams and add members to the teams.

Example
=======

```js
var teamPlansWidget = require('../');
var teamPlansWidget = teamPlansWidget();
teamPlansWidget.appendTo('#teamplans');

teamPlansWidget.on('newTeam', function (team) {
  console.log('New team created: ' + team);
});
teamPlansWidget.on('newTeamMember', function (member) {
  console.log('A new team member added: ' + member);
});
```

In this example when a user creates a new team, the widget emits `newTeam` event. We just log this to console. Same for adding new team members. When a new team member is added, the widget emits `newTeamMember` event.

Todo: deleting team members.

Methods
=======

## var teamPlansWidget = teamPlansWidget()

Return a new team plans widget instance.

## teamPlansWidget.appendTo(target)

Append the team widget to the dom element or query selector string target.

Events
======

## teamPlansWidget.on('newTeam', function (team) { })

Team plans widget emits the `newTeam` event when you create a new team. The callback receives `team` parameter which is the name of the team.

## teamPlansWidget.on('newTeamMember', function (member) { })

Team plans widget emits the `newTeamMember` event when you add a member to the team. The callback receives `member` parameter which is the email of the team member.

## teamPlansWidget.emit('existingTeam', team);

Team plans widget listens for `existingTeam` events so you can initialize the widget for an existing team.

## teamPlansWidget.emit('existingTeamMember', member);

Team plans widget listens for `existingTeamMember` events so you can add existing team members to the widget's team members list.

Todo: deleting team members.

Install
=======

With [npm](https://npmjs.org) do:

```
npm install team-plans-widget
```

Use [browserify](http://browserify.org) to `require('team-plans-widget')`.

License
=======

MIT
