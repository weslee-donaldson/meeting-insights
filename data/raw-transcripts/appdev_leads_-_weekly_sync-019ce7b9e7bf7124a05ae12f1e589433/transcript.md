# AppDev Leads - Weekly Sync - Mar, 13

# Transcript
**Stace | 00:02**
He has a state of integration that would be good for...

**Wesley Donaldson | 00:02**
A man has a fav.

**Jennifer | 00:07**
No, I can't remember. I don't think he said that. Maybe he accidentally put that in.

**Wesley Donaldson | 00:18**
Hey guys. Lit. Sorry, just jumping in. Clearly, I probably missed some context, but the state of integration is a request from Sam and his direction there was just... If anyone can make it, great.
If you cannot make it, it's not a big deal. But he was specifically asking for some time with the engineering team states. Of course, that includes you and ideally anyone else who can make it on just to revisit where we are holistically across the architecture. His intention is to bring AA an updated diagram for where the architecture currently is.

**Stace | 00:57**
I think it's a great idea, right? A lot of moving parts right now, can't hurt to think about that.

**harry.dennen@llsa.com | 01:04**
Can it move by like thirty minutes?

**Wesley Donaldson | 01:07**
I can. I think the tic-get time on calendars. But I can move it and see how calendars look.

**Stace | 01:14**
Harry, are you out next week?

**harry.dennen@llsa.com | 01:17**
No. I'm not.

**Stace | 01:19**
I think you have been out of office on your calendar, which is why I could move the other meeting to next week. Do I spring?

**harry.dennen@llsa.com | 01:27**
I had an out-of-office for last Wednesday two days ago. Is there really...?

**Jennifer | 01:35**
Interesting, it's all week next week seriously.

**Stace | 01:38**
Yeah, that's why I tried to squeeze that EP meeting in today as it looked like you were leaving next week.

**harry.dennen@llsa.com | 01:49**
I see. Spring break. Did I add that? Is that mine? I'm just... My kids are off, I'm not off.

**Jennifer | 02:02**
Okay, so we'll move that one.

**harry.dennen@llsa.com | 02:04**
I see. Yeah, okay, sorry, I was marking that calendar for myself. This is odd, and I don't think this is supposed to be on here. This is really weird. I don't recall doing that by... Okay, let me just remove it. I'm not out next week.

**Jennifer | 02:33**
Okay. Do we want to get started? Wesley, did you want to start with yours?

**Wesley Donaldson | 02:43**
Sure. Excuse me one second.
Top down. Miha is working through... He has... What did he say? I think he has about 100-200. I forget the exact number, but he's running the script right now, per the direction from Ray, we're going to throttle this at 2000 for this morning.
So the script is running... NoE blockers on getting these replayed. While he's working through that, he's working through the alerts. The dear AQ alerts that we identified, there were a few of them, so they're documented. Tick it.
But ultimately he's... He has a PR up for actually adding these alerts to the system looking for a review on it. No blocker and that expects that unless something is flagged in review, I guess actually let me open that up. Do we want to do a larger effort around this review?
Maybe Jennifer, Harry, you guys should be part of this review as opposed to just engineers.

**Stace | 03:47**
Yeah. Sure.

**Wesley Donaldson | 03:48**
Yeah, all right, I'll get that over to you guys. Actually, it's 07:48.

**Jennifer | 03:53**
Thank you.

**Wesley Donaldson | 03:54**
I'll message you directly with it. I asked him just to... The intention for me is how time is to have him jump on and with epic 1.2 for recurring.
That's after the ingestion. But I've asked them just to spend today on closing out this postmortem, which is related to the blue-green. Jennifer, you have most of this information, but just right doing the write-up for it. My question would be for the team, if we want to do a meeting to present it, or just because this is an unknown quantity at this point, do we just need the write-up to add to the tracking that we already have?

**Jennifer | 04:37**
Let me read over the write-up. I guess the question is how much more from our last one? Do we need to talk about any additional things that we have to do with blue-green going forward? Or are they all tracked?

**Wesley Donaldson | 04:55**
There are... I think he raised all the procedural challenges, and he shared details into what the underlying cause was.
But there was no formal write-up for it. Trans... The question of whether they are all tracked, is there anything else unknown? There is a separate ticket as part of... To document all of these alerts and review them and do a review of all the things that pertain to blue-green.
That's part of this epic. I'm trying to balance the importance of both relative to recurly. So I think the expectation is that he's running both that investigation as well as epic 1.2 for recurly.
Okay, so that's the priority items from the SRE track. As I mentioned yesterday, this is now ready for prod. It's been reviewed and good to go. We're going to be doing a training session on Monday for the next engineer to tackle it, but no additional follow-ups for this coming out of that training session. Obviously, we'll update the document, update the playbook, and be able to share it with all the team members. Harry, I'm thinking this could be something that's bigger. Jennifer, this is bigger than just Mando or engineers ideal that this playbook is something that any team member can consume and just be able to more effectively monitor the alerts and triage them.

**Jennifer | 06:17**
He sounds good.

**Wesley Donaldson | 06:18**
We could take the first pass starting next week. Going from right to left on the board. I shared this with Beth, we're a little bit delayed on all of these. The resolutions on some of these defect items, all of them are in review.
I've asked the team. Some of these are three days or two days old. I've asked the team to prioritize getting their reviews in and to spirit them themselves as opposed to asking. So no issue that the plan is to demonstrate all of these defect items as a whole to the product on Monday's working session. The team is tracking towards that. We've completed some additional tasks that are pushed into review, for example, the fix around the fifteen-minute appointment window. Your office has addressed that. He's addressed the issue with membership not clearing the diagnostics that are pre-included inside of membership. More importantly, I think effort towards supporting recurring going forward. Antonio has pushed the Emmett work and has a POC that he's having engineers review. It's pushed into "Ready for review" and as part of that, he's completed the blue-green development environment for recurring as well. For commerce, this will not go live this week like I've asked him to post in the channel for deployment on Monday. It should not have any impacts on end or existing work as a brand new environment.
Just for the sake of being cautious, we're going to push this over to deployment on Monday. Good progress on the CD key work. This is again for recurring. This is spinning up the API gateway. The Lambda is the core infrastructure.
So for this one, I think it's a similar idea here. Jennifer, Harry, like this, we should get you guys to review. Some are just aware of what is being added to the stack, but this is ready for review as well. He's going to peer...
Look, he's had a couple of items that are part of review. He took a bit of a pause on this one to focus on getting this into a good place. So he's clear that this needs to be part of the review on Monday.
So working through that as well. This is still on hold, but got some good clarity. Repeated clarity, I guess, from Francis and Daniel. This is just internal... The team is still trying to figure out how to solve for this. They're projecting that they'll have this completed for the end of the week next week.
Just a reminder of what this is: making securing the LSA private directory as part of the release notes. Beyond that, the team is just tackling tickets as they come through. Lance is currently working through the order ingestion. He had a decent amount of questions coming out of last week, but we had a small session where he just got all those answers directly from Antonio. Beyond just the question and answers was within the ticket itself.
So we left that meeting everyone feeling... Yes, we're aligned to what we already agreed to for architecture. So no blockers on the recurring 1.1 epic at this point. That is it for Mandalor. Any questions?

**Jennifer | 09:31**
Now that makes sense. You're good as far as having everything that you need for next week.

**Wesley Donaldson | 09:39**
For next week? There is a decent amount of meat on the table relative to recurring... The plan is to tackle this epic for next week. For most of the team, it's not...
So, this is basically everything after the... In the initial ingestion. So we have all of these. This is going to take up probably two or three engineers, I think just the proximity of Lance in Germany. If Lance is able to complete the Lambda work this week, I'll probably have him jump on and help with this.
If not, it's a race condition minimum. Antonio and I will be in here. But I'd like to get Lance or Jeremy in here as well. But Lance is working on 1.1. So it's really just a matter of who's available when.
Yes, I have enough where the team can continue working on commerce, have the clarity that they need, and we have the bodies that we need to work on this. Sorry. One thing, apologies to Bett, that I didn't touch on is the three smaller epics that you provided to us this week, Jeremy's on all of those. No blockers are concerned on that, so we should be able to tackle those
probably into early next week. He's just closing out some of the MVP stuff that he has. Once those are completed, he should be able to take on the three smaller epics that you gave us.

**bethany.duffy@llsa.com | 10:58**
Who've got it?

**Wesley Donaldson | 11:00**
Six. Now that's it.

**Jennifer | 11:07**
Okay.

**Wesley Donaldson | 11:07**
For...

**harry.dennen@llsa.com | 11:18**
Okay, from the completed side, so the new gateway for the admin portal required a custom domain for the API, which we do not currently have. Nick updated the code to use a custom domain that will get passed in via variable. Francis is working on actually getting us that domain, which we should have today, but I don't think we're going to make those gateway changes today.
I think we'll probably do that on Monday, but at least there won't be blockers for this anymore. I'm in Gateway, the new Cognito account event streams are in that went live this morning after the no. JS... Well, everything looks good on that. I watched the logs, the normal patterns continued, and didn't see anything strange. I checked the event stream, and I can see the Cognito account v2, the new stream showing up with the appropriate events in there.
So all looks good, and the nice thing is that now that we've got those, it gives us some more tools in validating who should be created from a Cognito side, which is what Dane is still working on here.
So he's... He's got the three different scenarios for when we create. We had to make a little bit of a trade. I was shooting for all this stuff resolved this week but on the stability side, we didn't want to... This issue where we have a default throw when I first passed it looked like projections and aggregates.
It's connector event handlers. There's a pattern where the event type string is being used as the selector for object properties, which are the command handler functions. Not to get too technical, it just means there is another avenue of a default throw.
So we talked about yesterday. I increased the scope and he's updated that so that's all going to come in. I don't want to deal with the shape of the problem anymore so that's why we decided to do that. The Shopify DLQ this is intermittent.
So some purchases are happening. The hook is going into the or some events are going to the dead letter queue. We don't know why yet, but not all of them.

**Wesley Donaldson | 13:43**
Jump but not so...

**harry.dennen@llsa.com | 13:47**
So I spoke to Nick this morning and said, "Try to replay some."

**Wesley Donaldson | 13:47**
But. Thanks. Morning. Ch.

**harry.dennen@llsa.com | 13:50**
If they go through, we know it's an intermittent error. If they don't, we know there's something that has possibly likely changed from Shopify. I'm going to figure it out.

**bethany.duffy@llsa.com | 13:58**
Yeah. So on that note, I see there's a bug. I think we need a break fix, which is a little bit more time sensitive to rerun the 60 orders that failed because of shop... If I didn't write the customer's name back to their account for some reason even though it...

**harry.dennen@llsa.com | 14:19**
Okay, so it is... Okay, well, that's good. Then we know what's most likely causing it.

**bethany.duffy@llsa.com | 14:23**
Yes, I think it was a Shopify outage, but we do need to get that break fixed in. Jeremy has a script that he's used before to rerun when we're missing metadata, and he said that we can probably alter that script a bit to be able to use it for rerunning with the missing last name.
Customer service already put together a spreadsheet with the shop if the order ID and what the last name should be because that was what was missing for those 60 orders.

**harry.dennen@llsa.com | 14:49**
So if I understand correctly, we would have to take these events, put the last name on it manually from our own data, and then replay them so they work.

**bethany.duffy@llsa.com | 14:56**
Yeah, he said it's doing some sort of scraping of the data from our logs or something like that. Okay.

**Jennifer | 15:05**
So I think the way that Harry is thinking about it might be faster.

**bethany.duffy@llsa.com | 15:09**
Okay, sure. In this...

**Jennifer | 15:11**
We have most of the information.

**harry.dennen@llsa.com | 15:13**
All right. Well, maybe we just chat about it once I get through the rest of this. Sure. Okay, so that's good news, at least we got to wait for it out of this. Nick will be happy because he's confused. I'm not sure about Francis's issues here. I know he's been helping with Nick for the last couple of days on the portal stuff. This error is done. This was, I think, a one-off issue because something was down.
Then this one is, I think, he's still actually working on this. Then the Colonosky stuff is no longer blocked, right? Thanks for the clarity there. Stefan, this is starting to grow.

**Wesley Donaldson | 16:01**
Step. Step.

**harry.dennen@llsa.com | 16:04**
So I've asked them to just do a layered approach to the test coverage there, and then we'll get some subtests so we can see some movement instead of just one giant PR that takes two weeks.
That is our update. As far as in the pipeline, we look things are looking good from Ray, what we pulled apart already and then plus the other thing that's coming in around what was it status. So I think as far as work done and work to do, we're looking pretty good.

**Jennifer | 16:38**
Okay. For the admin portal, for the gateway. I think we had said that we were going to hold off if it was going to take too long. I feel like it's gone on for a few days. Is that something that we need to just hold off on?

**harry.dennen@llsa.com | 16:52**
No. So the work is effectively done. The challenge is getting a custom domain from... Which Francis has requested and should be resolved today. So in my estimation, there's very little work to actually be done to actually turn it on. The code has been written. It was merged early this week. This part was missed.

**Jennifer | 17:18**
Okay, so there's no active development on it, just waiting on that other stuff.

**harry.dennen@llsa.com | 17:23**
Correct.

**Stace | 17:25**
Yeah, and this was all to put it behind the BPN. Yeah, okay, all right, well, it's not lost work because we'll use that same API gateway when we start to do call center and commerce.

**harry.dennen@llsa.com | 17:37**
Yeah, hundred percent.

**Stace | 17:38**
It might be a different domain for the call center app, but again, this work pays that forward.

**Jennifer | 17:46**
Yeah, okay, and then as far as next week, do you guys have everything that you need?

**harry.dennen@llsa.com | 17:57**
Yeah, we do.

**Jennifer | 17:59**
Then what are you expecting to have as your goals? What are we expecting to be able to get completed next week?

**harry.dennen@llsa.com | 18:13**
We haven't committed to what we can accomplish next week, but we do know what we're looking at. I can have an answer for that this afternoon.

**Jennifer | 18:23**
Okay, that would be helpful. I just want to know what our goals are for next week so that we can see how we're progressing. Because I know that we were hoping to get the state management by this week, but it sounds like the stability and the other stuff came in so pushed that out. It works.

**harry.dennen@llsa.com | 18:59**
On the DLQ, the Shopify thing. Should I...? I can get a hold of Jeremy and talk through what we're going to do here. Beth, that sounds good.

**bethany.duffy@llsa.com | 19:16**
Yes. That works. Do you want me to create...? Well, I guess there are two things. I'm curious why it was failing when the customer account name was failing because I thought we were using billing information and the billing information in Shopify looks to be populated, so I think that might be the scope of what was happening for this case.
Then the break fix will just be rerun those 60 orders, and I can get that created and attached to this and I'll drop the spreadsheet in there.

**harry.dennen@llsa.com | 19:49**
Okay.

**Jennifer | 19:50**
Harry and Nick, meet up with Jeremy to get that going. Okay?

**bethany.duffy@llsa.com | 20:00**
I'll drop some timing in there if we can do it today. That's obviously preferred because every day that we delay rerunning them, we run into essentially not being able to schedule those appointments.

**harry.dennen@llsa.com | 20:11**
So 100%.

**Stace | 20:13**
Okay, but this does all look to be from that single data error from Shopify. There aren't other random insert problems or are there?

**bethany.duffy@llsa.com | 20:29**
I don't know. I just know that customer support saw that uptick for the last name missing. I don't know if there are other things sitting in the dead letter queue that we didn't know about.

**Stace | 20:40**
Yeah, and I'm just going to throw this out there. So it's in everyone's head, right? If you do see evidence of random things not going in, yeah, I think so. At least some members of the team are aware, right? Ops will post every now and then. "We are seeing concurrent thread and thread bound issues within the e-com application cluster." I haven't been able to get a real good idea yet of what's causing it.
It hasn't been bad enough where we've dedicated fixed time to... Which is okay, but we should be cognizant of it. My suspicion is it's not due to the public e-com site unless we're getting a bot attack that should be getting almost zero traffic.
So if we're getting bottlenecks, it's probably due to the inserts, so it could be impacting Shopify. Now we want to spend a whole lot of time on Shopify specifically as we're trying to get to recurrly.
Maybe not, but I think I just want everyone to remain cognizant of it because it could exist when we create the recurring cluster. So if you see evidence of random failures, it's probably something to do with this thread issue.

**bethany.duffy@llsa.com | 21:57**
That makes sense. There are every now and then. So I really only escalate issues from the Shopify support team when it's more than a handful, but every now and then they'll find one or two that failed and didn't show up on the proxy report.
So I asked them just to keep an eye on it and see if it picks up. It usually doesn't. So I'm wondering if that could be related to that.

**Stace | 22:17**
Might be it. In which case we probably should figure out how to like what's the answer? Is there a fix a bug that's causing it or do we need to scale on the cloud side? Okay, but again, kind of cognizant as we duplicate that.
I mean, maybe it all goes away because you're going to duplicate everything for comp, but just kind of throwing it out there that it exists. So if you see it in clues, [Laughter] bring them up.

**Jennifer | 22:48**
Yeah, from what I heard, it was supposed to be only affecting the thread issue was on the app itself and not on any of the backend stuff.

**Stace | 23:01**
Yeah, but that's what I heard too. But like I said, it's just kind of has a funny smell since the app itself is getting no traffic. But it might be a side effect of something else, so I don't want to turn it into something it's not. Just reminding. Everyone's there. In case. In case you see something as we're digging around.

**Jennifer | 23:20**
Makes sense. Okay. Beth, Ray, or Greg, is there anything you guys have in process that you will have to us by next week that we should be looking out for?

**bethany.duffy@llsa.com | 23:40**
I have one. The tracking piece is ready to go. We'll just be doing Google Tag Manager for this first round. So I have the development script that we can put onto Sandbox and test it out, and then once we're ready, we'll do the same thing in production.
So that one should be ready to go Monday. I just need to copy the information into a ticket basically at this point. Then I think the rest of it really is just validating all of the different pieces of information getting into CSTAR.
So I will continue working on post-production launch things until we're ready to do a full end-to-end test in the lower environment and see what's not working as expected. Okay, less.

**Wesley Donaldson | 24:36**
A quick question on the GTM. Is it literally just the tag you're looking for us to drop in the experience? Is there any custom object or anything they need us to build?

**bethany.duffy@llsa.com | 24:46**
No, it's just a script that needs to get put in the header.

**Jennifer | 24:59**
Ray, on your side.

**Speaker 6 | 25:00**
For indoor there's the multiple screening that one just finalized the design, but the ticket is ready. We have the... If you let me... If you go to the backlog, Harry, can you click the backlog? Just click on the backlog.
So display all diagnostics regardless of the status. The one that we refined yesterday as a team lead level, that one is ready to go. So those two are in the pipeline in the bottom backlog portion 07:54 and 7701.
Then we have... We started the Sunset Legacy portal EPIC, which will start... Keep creating tickets based on the clinical result audit as well as potentially any other IDI DM use cases that we identify starting this week.
So definitely we'll have more tickets coming for that EPIC. Matter of fact, we just got one more text change. There's a content change that we need to update as identified by the clinical team.
So for the next week... Definitely... Everything in the to-do list already, plus the displaying of the diagnostic, and then I expect between the multiple screenings and the rest of the Sunset Legacy portal to keep us going for the next couple of weeks. The goal is always to be completely done with Legacy Portal and my processing... I made first.
So in between now and the end of April, the next month and a half is for us to identify anything that ID might does for us that we didn't know, get it all documented, then determine whether those are things that we need to migrate into Thrive while we can. Sunset as a Legacy process altogether.
So more to come on that as we identify those use cases.

**Jennifer | 27:38**
2, did we have anything else that we wanted to...? Anyone want to bring up for this group? I had brought up some things around approvals and how the demo process is going and everything.
I think people have started to do a little bit more demos. But, Harry and Wesley, I don't know if it's something that you guys can do to have a retro for your teams. One of the things... Be on the quality and seeing how the approval process is going with everyone, that could be definitely a question that we could have in the retro.
I know we haven't had a retro for a few months now, so it might be helpful. Then we can talk about that next week. Awesome. Okay, if there's nothing else... Ray and Harry, did you want to stay on and go over that one ticket that you had, the 7904? Ray, sure.

**harry.dennen@llsa.com | 28:53**
The new epic.

**Jennifer | 28:54**
Yeah, good, thanks, Aan.

