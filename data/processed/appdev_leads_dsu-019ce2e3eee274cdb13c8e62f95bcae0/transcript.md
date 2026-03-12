# AppDev Leads DSU - Mar, 12

# Transcript
**Jennifer | 01:11**
Good morning. I think we can start with the view of us. I moved the meeting time, so not sure if everyone's going to be joining. Do one of you guys want to start?

**harry.dennen@llsa.com | 01:29**
Sure.
My queries.
Right, this doesn't look fit.
Why is nothing working? Okay, so just... Are you on the VPN? I am that's probably what's going on.

**Jennifer | 02:32**
Get off the VPN. My... Never works with it.

**harry.dennen@llsa.com | 02:36**
Disconnect. Okay, there we go, and maybe one again. Yeah, that's very odd, my board still looks weird.

**Jennifer | 02:51**
You have a type filter, that's why.

**harry.dennen@llsa.com | 02:58**
That's right though.

**Jennifer | 03:00**
You do everything, but I think... Yeah, that's okay if you can scroll up. Yeah, okay, that's fine.

**harry.dennen@llsa.com | 03:07**
This looks more accurate. So, I was obviously off yesterday. The changes to the admin portal have gone in. Those are live. The result status is accurate now from Nick as far as the API gateway goes. He ran into an issue. Francis is helping out there. There is no... This doesn't... It does...
Yeah, so the actual shipping of this is blocked until we've got a custom domain for the API. Yeah, so waiting for infrastructure to give us that and then that can go live on the stability stuff, the urgent side. I went through Jane's PR. He's got a couple more changes to make. We had a look at the aggregates without getting into the technicals of it. They have a look up on event types, but this one should be protected by TYPESCRIPT build time.
So we've gone ahead and changed it from a throw to a log error, but to raise it as... We shouldn't end up there if TYPESCRIPT has worked appropriately, because while the properties or events are now optional, the actual events are not. Those are required.
Then looking at conflicts with mine. His goal is to get all three of these in today, which I think is doable. Then he's got a draft of the correct conditions, which I'll look at this afternoon as well.
So these are moving. Expect all these to be in by tomorrow morning, if not today.
DAVIES: Those are... Francis has more updates to do from IOVIS around the denote updates, and DJ is dealing with some extra pieces picked up around the PRP, and we have big test coverage coming for a portal from Stefn.
I think that's everything that's on the go right now.

**Jennifer | 05:25**
For the tickets that you're hoping to get in today, those are like wide-reaching changes right there.

**harry.dennen@llsa.com | 05:34**
Stability, yeah.

**Jennifer | 05:35**
Yes. So whenever we do get those in, let's make sure that we have someone tagged for monitoring the system to make sure that there are not any extra logs or errors getting thrown or queues getting filled.

**harry.dennen@llsa.com | 05:53**
Okay? Do you have a name for me?

**Jennifer | 05:58**
You were... Dane.

**harry.dennen@llsa.com | 05:59**
Okay.

**Jennifer | 06:00**
Who's on it?

**harry.dennen@llsa.com | 06:02**
Are you talking about our schedule?

**Jennifer | 06:08**
You said someone... I'm talking about. When you and Dane push out those changes, will one of you please monitor to make sure that nothing's breaking over the next couple of days? Yeah, okay. I just want to make sure to call it out that we want to be sure since it's such a wide-reaching change that we don't want it to be full system. We don't want to break anything.
Yeah, okay, and then another thing coming in for this team. I went over the MMA tasks with DJ. So that's going to be coming in especially because they want to turn off the... They want to do that migration for memberships into Recurrly soon.
So that's going to actually become a higher priority.

**harry.dennen@llsa.com | 07:11**
So I saw these have rough estimates on them, but kind of nothing else. Do we need to go through the environment on these as a team or what? What would I do from here?

**Jennifer | 07:21**
I left the... So we can do the rough refinement with... Yeah, we can do it with DJ, Frman, and Francis. I think... I was thinking that when I was talking with DJ a little bit about the estimates that he could really take care of the first two, which are the code changes.
Then there's going to be sending the logs to SharePoint. I was going to see if Frman could take that since he has experience with the order proxy. Then the second too... I was going to see if Francis could help with alerting setup. That way we can get it done sooner than just one person working through it all.

**harry.dennen@llsa.com | 08:03**
Yeah, it makes sense. Okay, so you don't want me to go through this stuff? I think it is clear enough with all the details on the epic.

**Jennifer | 08:14**
I might go through it with them individually, but it'll get filled in before we assign it.

**harry.dennen@llsa.com | 08:20**
Okay, cool.

**Jennifer | 08:25**
Okay. So that's the next priority for that team. West, do you want to give your update?

**Wesley Donaldson | 08:33**
Yeah. So we do have still a few P ones on the board. The one that we had yesterday was running a subset of the 40,000 events we completed yesterday. We have completed that. We did identify an opportunity to run an additional 5,000ish events around results ready, so we partnered with Ray and Jennifer this morning to clarify that. So we have a plan of attack. How it's running that now this is done. Jennifer, Harry, just wanted to look for this meeting. Just to finalize. Nothing outstanding on this. We can close this out the run from yesterday.

**Jennifer | 09:18**
Yeah. That should be fine.

**Wesley Donaldson | 09:22**
So once we complete this and the projection is... Ray has asked us to throttle the efforts.
So this is probably going to stay on the board until the end of the date tomorrow just to wait till we have that full. Then there are no negative impacts from it but no issues, no blockers, and that's running through the next thing down within the SRI epic, these are held back in favor of the P1 effort, the P1 issues.
But as part of the SE effort, we did get... We did move the ticket for generating the playbook. So that moved it from review. We had a review from Jeremy and from me myself on Jeremy minimum, but I believe you and us saw this. We moved this into "Ready for Prad" and we're looking to assign this. I asked the team to volunteer. I'm most likely going to have to pick somebody, so we'll have a team member jumping on this. We'll have me out presenting this tomorrow and then a team member taking ownership of the first run of it with support from Miha starting next week.
That's part of the larger SR effort. Things that we were able to complete over the past day. We mostly around some of the refinement issues that we had from MVP. So one to three items were moved, three items removed from that EIC. Sorry, I can't count, two items removed from that. Devon Dens is doing a pass of them, but I think he's already looked at both of these.
So expecting this one to move into "complete". We have a few other items as well from the refinement effort. Those are in review. I think three to two items moved out of review on this one. Two items moved out of review from yesterday's status, but we had some additional clarity that was needed from Jeff's tasks.
Looking good here. I reminded the team of my concern of just how long things are staying in review, they're aware of the issue. Right now, we're asking team members to explicitly ask someone, as opposed to just posting in the channel. See if that gets a little bit more traction on just getting things out of review. This ticket has been on the board for a while. I connected with Antonio and Sam about this.
It's part of the larger conversations space that you've had. You're having with Sam as well as part of the conversation at the meeting that we set up for tomorrow in my sink with him this morning. My understanding is the direction here is like they're going to present this work to us.
Antonio is going to immediately start acting on this Emmett pattern and start taking on some implementation tasks. He'll have some ownership beyond just the normal workflow that the team that we normally assigned tickets out.
That's the direction I have from Sam and Antonio. If that changes or if the meeting tomorrow changes, I will absolutely let the team know, but just be aware that there is action on this.
It's not stalled, it just because it's not moving on the board. Additional items that the team was tackling, as I mentioned two or three buckets here. The continued refinement. So Jeremy has one that was opened by Stephen.
It's very detailed. He's just triaging and making sure that it's not the same thing that we already had in some of the other tickets because Stephen's feedback was across the full spectrum. There were two specific comments that were left over on the ticket.
So Jeremy's looking at them. Expecting to probably close this out or move this back to review today because we think it's already done. The deadlier queue is something that how is working on that's not part of refactoring. Apologies shut before, but this one is related to part of the investigation with generating the playbook. We identified some deals that weren't... Didn't have alarms against them.
So taking that as the next priority item, not a P1, but the next high priority item that Miha is working on and he's doing this in parallel with the rerun event. So they're expecting to... At the same time, have a PR up for today as well.
But the rest of the team is tucked in around the recurring epic. So GFFCO and Lance connected with both of them. They posted. Both of them posted some pretty detailed questions back on their tickets. Antonio has provided a comprehensive response to land, so don't expect there to be a blocker there.
I've reminded the team to make sure Antonio was part of those conversations and reflecting on what was done, what we agreed to in the architecture meetings, which Antonio was on top of a couple of things for your Elvis and I did connect with him just to make sure I'm accurately reflecting his bandwidth and his priorities on the board. He has a few things that we've been... Yes, the 15-minute rule that is part of the larger refinement from MVP or missed feature from MVP, but he has a couple of other things around the account ID which is again from MVP effort that was missing.
Then we flagged, I flagged an issue yesterday evening around how we're handling membership and the diagnostics that are prebuilt into membership, they should be showing up on the board. So those are the two next critical things on his plate after that. My general take on your office is trying to leave him some space. He mentioned he has some other priorities he's working through.
So leaving him a little bit of space for those priorities but clarifying with him that if he has bandwidth, the tickets that remain on his board are very much focused around... As I said... But as I said yesterday, just how we approached delivery within the work itself.
So he's aware of these and he's going to tackle them as he has bandwidth. That is pretty much it for the team. One item I'm still trying to get clarity on is as I mentioned, with Antonio taking a little bit more of a detailed ownership here and taking on some tasks for this.
That may impact recurring 1.2, the CL work, and how we're pushing information into CSTAR. So I'm not clear yet exactly what that's going to mean from a board perspective. So I'm working with him to figure out how that's pulling them on to the board and assigning them all to him, if that's something different. I should know that by tomorrow's status.
That's it for Mandalore. Any questions?

**Jennifer | 15:29**
Just for the ticket that you have assigned to Antonio, that's not moving. Is there any progress that we are tracking on that to make sure it's staying on track or just to see if he's getting certain things done?

**Wesley Donaldson | 15:40**
Yeah, I feel the same way. I think my ask to him was like, "Can we at least present this portion of the ticket where we explained our plan of attack for this?" When I pinged him and Sam, the direction I received was...
Still reviewing that. Coming to a plan of attack from architecture. They had a meeting yesterday afternoon for about an hour. So coming out of that, their ANT will be pulling together a plan of how MT will be used in the post ingestion process. I don't have a deliverable. I don't have an incremental beyond that I can share.

**Jennifer | 16:16**
Okay. It could be something as simple as once they do get the plan, just a checklist on the ticket or something.

**Wesley Donaldson | 16:21**
Exactly. Yep.

**Jennifer | 16:23**
Yeah, it doesn't have to be super big.

**Wesley Donaldson | 16:23**
I totally agree with you. I'm asking the same thing.

**Jennifer | 16:29**
Awesome. Thank you. Anybody else have anything to bring to this? Ray, you had mentioned possibly changing priorities from the multiscreening to displaying pending on the results.
Displaying pending results in the summary and detail view. Did you want to discuss that a little bit?

**Speaker 4 | 17:07**
Yeah, I have to put the... Together still, but while I'm still waiting for Step one to have another test user environment to see how participants can see the list of tests that were included in the order, I think it's safe to say we should have this new ticket to call out. Specifically, everything on a screening order should be visible before or after screening, regardless of their status for each individual as a diagnostic.
So once that tick is ready to go, depending on timing, I think that can go before the multiple screening display because the team, from what I'm hearing, is closing out on the status management one point one early next week.
So by the time they pick up the need one of those tickets, they can work on the what I just described to display or diagnostic on any given order first before showing the multiple screenings.
Any questions on that? That wouldn't change the technology for today, tomorrow, probably not even Monday, but that's what I expect to happen sometimes next week.

**Jennifer | 18:46**
When do we expect to get that to the team to refine? Because I think Harry, didn't you say you guys would be refining the multiple screening soon?

**harry.dennen@llsa.com | 18:56**
Yeah, we went through 1.1.

**Speaker 4 | 18:58**
The first bit. Yeah, we have the mode. We can find a multiple screening today, but I would say if we can refine the new display or diagnostic per order tomorrow, I think that will be the best.

**Jennifer | 19:19**
So I... Will you be bringing in diamond today?

**Speaker 4 | 19:24**
Yeah, I can't have that for today. It's just one. It'll be... I'm going to group the more underneath the commission legacy portal epic or project, but I'm going to only start with displaying or the analytics on any given order. That should be the first one.

**harry.dennen@llsa.com | 19:51**
Okay, so you're. You're referring to status management? 1.2.

**Speaker 4 | 19:57**
No, we're gonna change it to different because this is not a status management.

**Jennifer | 20:01**
Requirement that's coming in.

**Speaker 4 | 20:04**
Yeah, this new thing would... If we're calling this a new feature, it's going to be going to a new epic, which we will name it as "decommissioning next portal" because we're finding out things that we need to have on the portal.

**harry.dennen@llsa.com | 20:24**
Was this the one that we started digging into yesterday? Okay, I understand.

**Speaker 4 | 20:29**
Yeah.

**harry.dennen@llsa.com | 20:30**
So but that so that means with what we refined on Tuesday, we're still good with all that.

**Speaker 4 | 20:35**
And that those are good. That's what I'm saying. What we find Tuesday is good to go for the team.

**harry.dennen@llsa.com | 20:41**
All right.

**Jennifer | 20:41**
So I'm just holding off on refining the multiple-screen multiple-screening.

**harry.dennen@llsa.com | 20:48**
Yeah, I'm trying to find that epic. Can you hear me? Yeah, and I'll navigate... I mean I'll drive it just...

**Speaker 4 | 21:00**
That one is not right.

**Jennifer | 21:02**
You don't have tickets for this, right?

**Speaker 4 | 21:04**
The new one that I just described... No multiple screening is in the backlog 771 but I don't have a new one for decommissioning the legacy portal yet.

**harry.dennen@llsa.com | 21:16**
Yeah, I think... Yeah. So I think...

**Stace | 21:20**
What was...

**harry.dennen@llsa.com | 21:20**
The issue is that in one of the things we were trying to work out, it turned out there were actually two scenarios. There was the before and after, and we don't have anything accounting for half of that.
That's the new stuff. So if I understand correctly, we're going to crack on with 1.1 and then next week you'll have... Or at some point, you'll have some definitions for us for whatever that other part is, and then we'll reflect that.
We're not going to stress about 1.2 1.3 right now, or sorry, 1.2.

**Speaker 4 | 21:44**
Because 1.2 is still in backlog. We haven't moved to the 2D yet. Okay, all right, cool. So that's fine.

**Jennifer | 21:51**
There's multi-screening on this screen.

**harry.dennen@llsa.com | 21:55**
771, second again, seven and seven... Okay.

**Jennifer | 22:01**
So okay, so 771 is still in backlog. Okay, that makes sense. I was confused.

**harry.dennen@llsa.com | 22:07**
Yeah.

**Jennifer | 22:07**
Multiple scrip makes sense.

**harry.dennen@llsa.com | 22:09**
Yeah, so, but we're not...

**Jennifer | 22:12**
07:39 above seven, actually, should 07:39 just... Beth, I know you said it was a priority. Now, should that be above seven or above 06:12 or...?

**bethany.duffy@llsa.com | 22:27**
Yeah, 7:39 needs to be done at the end of next week.

**Speaker 4 | 22:31**
Yeah, we can move 7721 lower because that...

**Jennifer | 22:38**
But it should. Should it be above status management as well, or should it be below status management?

**bethany.duffy@llsa.com | 22:46**
We're going to break call center processes if this isn't done by the time we renew and recurrently.

**Speaker 4 | 22:53**
Let's move it about 1.1.

**harry.dennen@llsa.com | 22:56**
Yeah, so, I mean, this is yeah, that makes sense to me, and this isn't going to be, I mean, this is looking like it's going to be DJ and Frman. Hey.

**Jennifer | 23:07**
DJ and Frman. Yeah.

**harry.dennen@llsa.com | 23:08**
I don't know if others of us need a step and we can, but that should be doable by next week if it's just them and they're not being bothered by production issues.

**Jennifer | 23:17**
That second part it'.

**harry.dennen@llsa.com | 23:20**
What I'm saying is that we have between Dane and myself, we have capacity and production. So I mean, if Dane covers Legacy and I cover Thrive, we should be fine. Then I'll give them the space to do it if that is... If this is the priority we can do that.

**Jennifer | 23:33**
Perfect. Speaking of, there is a production issue that I'm creating right now that the DL 2 your Shopify [Laughter] messages in it. I'm not sure if they just need to be replayed if they've already been...
I was going to ask Beth before I created it. I was going to ask Beth to see... To check... To figure out how to check the SharePoint log to see if these people are already in there as errors or not.

**bethany.duffy@llsa.com | 24:03**
What was happening?

**Jennifer | 24:05**
We have a Delq like a dead letter queue for the Shopify web hook and it has 54 more messages in it since yesterday. And so I wanted to check with you and compare the SHAREPOINT log and just make sure like if we like I mean, of course we need to see why there's stuff in there.
So there is some work for us, but I want to see what break fix we're going to need to do or not.

**bethany.duffy@llsa.com | 24:34**
Okay. I can get that link to you really quickly.

**Jennifer | 24:38**
You rock. Thank you.

**bethany.duffy@llsa.com | 24:40**
I did have a quick question because we've only got a couple of minutes left. I'm trying to schedule with Tevin right now over at Nick Curly. Are we at a point where we want to do a sanity check with them on our webhook stuff because we do have another integration workshop, and if we need to use it to make sure that we are pulling the data correctly, then we can.

**Wesley Donaldson | 25:02**
I think it doesn't hurt us to use the session just to talk through what our plan of attack is.

**Stace | 25:08**
What my suggestion would be is that because I think we discussed this even with Xolv, and I'm on the last call, it's probably good to set it up now. I think maybe next Tuesday or Wednesday might be a good thing where we have the basic webhook listeners created, and that's creating the events that's triggering a Lambda to go do the right queries.
That's where I think the team, if they're going to run into questions, they're going to run into questions at that point of, "Hey, do I need to wait for two or three things to get the whole order?" Can I get the order this way?
I think that's where we might be doing it. Think ones are a little bit in the weeds. Is that tracking with you, Wesley?

**Wesley Donaldson | 25:51**
Yeah, absolutely. They're literally working on it today.

**Stace | 25:53**
Okay, yeah, but it's good to bring up with him today, right?

**Wesley Donaldson | 25:54**
So we should. We should have something by. By Monday. For the. To share with them?

**Stace | 26:01**
Sometimes it takes two or three days to schedule, so... [Laughter].

**bethany.duffy@llsa.com | 26:04**
Yeah, that's why I'm about to fire an email off.

**Wesley Donaldson | 26:04**
Yeah.

**bethany.duffy@llsa.com | 26:06**
Because they need to schedule our training for our call center, our users. Then I wanted to make sure to get this on the books as well. So we'll target Tuesday and Wednesday next week.

**Speaker 4 | 26:20**
Sounds good.

**Jennifer | 26:28**
Awesome. Anything else from anyone?

