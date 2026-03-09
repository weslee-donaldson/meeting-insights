# AppDev Leads DSU - Mar, 05

# Transcript
**Jennifer | 00:03**
So he got to see everything. The only thing that we want to touch is what he had given as notes and then just leaving everything else alone. Good morning, Wes. Good job this morning. I don't know if Dane and Greg are going to be on, but we can wait for one more minute. Today got like this one.
Harry, did you see all my explanation marks? That's what it should say if there is not a stack, right? But no where if there's no stack, we need that many red excavation marks.

**Wesley Donaldson | 00:51**
Excuse me.

**Jennifer | 00:55**
So that's all I was thinking as I was putting that on.

**harry.dennen@llsa.com | 01:02**
Yeah, that was kind of wild, man. That took us a really long time to find a very dumb thing.

**Jennifer | 01:09**
As I was putting together the ticket, I started to think there are so many reasons why there might not be a stack that... I was like, "Okay, so maybe we shouldn't fail, but we should definitely alert or whatever."

**harry.dennen@llsa.com | 01:26**
Yeah, it. Yeah, it shouldn't be just like, by the way, hidden down in a footnote. You know, it should definitely like I would say maybe in the, you know, you get the summary at the bottom of the run to really like put some alarms and bells there is.
I mean, we do look at that. And if you're doing a deployment or a leg switch, you're following that. Make sure it worked.

**Jennifer | 01:51**
Yeah, like "New stack created." Good job on your initial creation of the stack.

**harry.dennen@llsa.com | 01:58**
Yeah, on green the 26th time. [Laughter].

**Jennifer | 02:05**
Okay, I guess they're not coming. So, Wes, do we want to start with you?
You're muted. If you're talking now...

**Wesley Donaldson | 02:20**
My sound is not working. Col.

**Jennifer | 02:23**
I hear you.

**Wesley Donaldson | 02:25**
Test. Test.

**Jennifer | 02:35**
We can start with Harry while you figure that out. Wes, sure. Okay.

**harry.dennen@llsa.com | 02:43**
Yeah, for the most part. I mean, there's a lot of firefighting for pretty much all week. Well, we seem to be in a better place now. Things are moving. Dane got a quick PR in to resolve the rest of the leg swap stuff. Now we have new code actually showing up, so the spots in error is finally resolved. All has been updated on the front end. I see... Ray. This one went to completed.
Okay. See, that's done. Now I think we have a bunch of stuff pieces to pick up around E Portal 1.2.

**Wesley Donaldson | 03:22**
Couple...

**harry.dennen@llsa.com | 03:28**
So we started in on that. Next is the Gateway Grass creating a couple under the hood updates. I don't know that we have so much new feature as just improvements, stability improvements.
Then the other one is the cognitive changes for getting people in with the new rules and the new activity streams so that we can check and have we can get that into the VR reports as well. So that's when people are created, when passwords change, we have all those events that are just on one stream out those will move into multiples.
I have it here, but there's going to wait until after we're meeting, that's the update for today and said you have more stuff for us next week.

**ray.li@llsa.com | 04:16**
Yeah or what I say demotized. Actually, the app pick for stay and stay machine one per one is already in the app pick is in the backlog already. I'm just looking to create more markups so that for the front end portion of it we can have tickets
but the Backgon logic should be already in. If you go to backlog and on here you can see that too should be WT status management yes.

**harry.dennen@llsa.com | 05:06**
Scheduled and screened cancelation yeah, we kind of derived we sort of yeah I remember this yep.

**ray.li@llsa.com | 05:13**
Cool.

**harry.dennen@llsa.com | 05:14**
So this is the one where?

**ray.li@llsa.com | 05:16**
Yeah, I1.

**harry.dennen@llsa.com | 05:18**
So is this ready for me to pull apart with the team?

**ray.li@llsa.com | 05:21**
I would let me go through, just a weave thresher with the team today on what do you call it on another refinement. We did refinement already, but I want to do a refresher soon since it's been almost two weeks now, and I want to add some markups for the multi-multiple screening. That would be the only thing I want to add, but otherwise, everything is ready.

**harry.dennen@llsa.com | 05:48**
What is this one? Remove renewal? MMA job.

**Jennifer | 05:55**
That is something that, for Recurly, when they do a migration of all the subscriptions, they're going to start doing the renewals in Recurly and not in CStars. So we want to make sure that we are not doing the migration or the nightly job that gets run to resubscribe or free up the subscription.
So we have to remove that. But we have to have a script that goes into Recurly or that gets webhooks from Recurly and updates the subscriptions on CStars when Recurly resubscribes them. So there's a lot to work with that.

**harry.dennen@llsa.com | 06:51**
Okay, so it's kind of a two-quarter one-turn-off the nightly job to find a way to listen to what's happening on Recurly, and then just put it into...

**Jennifer | 07:03**
I have two tickets for that one. Yeah. For one, it's to turn off the job. Then I think this one. Yeah. So this one's the one to remove the job. Then there's another one that I need to go through and plan on a little bit with DJ.

**harry.dennen@llsa.com | 07:19**
Would it not be the same epic, just two tickets?

**Jennifer | 07:23**
No, because they might have different timing.

**harry.dennen@llsa.com | 07:26**
Okay, got you. Cool. Do we know when this is going to happen?

**Wesley Donaldson | 07:34**
What's up, PO?

**Jennifer | 07:37**
I don't have a date, but March.

**Wesley Donaldson | 07:42**
Not right now, but mean like... I'll leave it in an hour.

**harry.dennen@llsa.com | 07:45**
One fifth of March.

**Jennifer | 07:47**
We are...

**Wesley Donaldson | 07:48**
Unusual like if they have the corn thing.

**Jennifer | 07:49**
Well, less than, right? More than... I don't know. Anyways, yeah. Wes, did you want to give your update?

**Wesley Donaldson | 08:06**
Yes, let's do it. So we had our final review with Greg this morning for the recurrent commerce MVP version. It went really well. We took away two items from that feedback that we need to action prior to the demo, so one is some styling work around the footer that's been documented and assigned out.
So feeling we would all be in time because it's the priority beyond that we are targeting now. We are going to be code freeze, what Jennifer said in the chat in the general channel, we're going to be code freeze by the end of the day today. What were we able to accomplish? Let me just share the board real quick.

**Jennifer | 08:47**
I'm sorry, I said code freeze now, except for those ones.

**Wesley Donaldson | 08:52**
Okay, yeah, totally understood.

**Jennifer | 08:53**
Okay.

**Wesley Donaldson | 08:54**
Yeah, the team.

**Jennifer | 08:55**
Cool.

**Wesley Donaldson | 08:56**
So the board looks really good for basically everything in the ready to prod. By virtue of the fact that we are reading the temp commerce store directly from Maine, all these are actually pushed against Maine already.
So I just want to take a quick pass at them and I'll move them all to completed. So we have completed all of the features, all of the additional feedback items that we had from our session last week and our session earlier this week, as well as the two outstanding items from this morning.
So great job, team. We have a few items that we've pulled in that are refactoring. So the additional feedback from this morning as well as some additional items are all going inside of Commerce refactoring. The direction from Product was to focus more around some of the UI fixes for next week, or at least until we get additional epics crafted that are refined over to us. No worries, we have a decent amount of work for us to tackle from the recurring backend process.
I've already documented three epics for that, so we'll be flowing those tickets into the team next week. But for this week, looking really good on the demo we have minor feedback that's outstanding. We actually were able to get through all of the playwright items except for one, and the only reason why that one is there is Stephan wanted us a little bit more time to verify each one of these because he did open the ticket.
So assuming that verification goes well, that will close out more concerning or more important. Harry, you've obviously been dealing with these. They are the work that me and how have been focused on. The top line for these is just the idea that the fixes are effectively in place.
So compliments to me and how for working with Harry and the team to get the resolution. But there is still a decent amount of work to...

**Jennifer | 10:36**
Yeah. And.

**Wesley Donaldson | 10:39**
Sorry. Okay, so there's still a good amount of work for us to... 1, we need a post-mortem around the blue-green, so it's six, nine, sevens. The resolution there is a post-mortem.
I think we need a little bit more detail on that one and then just dealing with the parked events. So me how is aware of these. He's actively working because I challenged him like, "Hey, what is the priority of your priorities?" He's working on them in parallel, they're all very much related.
I've asked the post-mortem to be... It seems like an obvious moment, the post-mortem to be the secondary item of his priority, just to make sure he's focusing on supporting and getting the events rerun as fast as possible.
But these are known quantities. Compliments to me how for just being able to really work through these effectively and pairing with Rommy where necessary to support the team. Next week is a little light. Full transparency, the exception of that epic around Commerce and the Antonio's perspective was the surface area. There are probably two engineers. I may be able to get up to three engineers.
So I think we have one additional epic that we talked about in the architecture meeting today. In a meeting with the team, there's some pushback on how much of that is things that we already have versus need to do.
So I'm pulling in maybe one or two tasks from that epic, hoping to get clarity before our next Tuesday meeting to bring to that to come continue the conversation so the team has enough work. We may be a little light and one engineer, I think next week.
But just as long as everyone's aware that is the expectation is we may be a little light. That's pretty much it. Again, let's take the win. Good job on the Commerce and getting ready for the Commerce demo.

**Jennifer | 12:22**
Yeah, that is awesome. A question on Miha running the events. Has he started running those? Because before he starts, we need to talk about the side effects of emails.

**Wesley Donaldson | 12:36**
So he's managing that directly with Harry and team. I said the same thing to him, like what needs to be run versus and he's aware of that concern. So he's not running them independently without partnership.

**Jennifer | 12:48**
Okay, Harry, like, as you guys think about it. Like, just make sure that raises a part of that with and like, if you can bring me in as well.

**Wesley Donaldson | 12:57**
[Laughter].

**Jennifer | 12:58**
Just to make sure that we're not sending unnecessary emails and we manage that the best way. Okay?

**harry.dennen@llsa.com | 13:09**
I think the duplicate email was part of that event in the wrong place, causing a re-evaluation of interpretations, which would cause a rescheduling of results. Ready? Which would cause another email in a blast seven days from now?
That's resolved. So...

**Jennifer | 13:26**
But if you guys replay the events, it could cause emails, right?

**harry.dennen@llsa.com | 13:32**
If the people are supposed to get emails, so if they have not looked at their results and they were supposed to get an email, then they'll get an email. So yes, it could result in emails, but they would be...
I think they'd be appropriate.

**ray.li@llsa.com | 13:45**
If I would say on logic... Sounds good, but I would have that list and check the web-iterable first. Even if we were going to send any emails because I want to check the actual delivery to see what's the history of their email delivery already before we say anything more.
We can take it offline.

**harry.dennen@llsa.com | 14:16**
Yeah, I want to chat with you.

**Jennifer | 14:21**
I'm just a little worried about that because... Yeah, and I'd like a little more chat because, why are they not getting the other emails? Because I thought this notification is literally sending the event to Iterable, that's what the rule is that got stopped.
So we'll chat maybe if we can get all together. Mary, okay, is there anything else high priority? I know there's a payroll thing going on. I'm trying to talk with Lydia and John from DBA about it.
But it might come to DJ depending on if they can figure it out or not. So that might be something that comes up.

**ray.li@llsa.com | 15:15**
What issues that...?

**Jennifer | 15:18**
So for those who don't know, we have written our own payroll software. So that Lydia had some issue the other day because somebody tried to run it, and it was running weird. They asked us to reset some fields.
So John reset those fields. And then we were told, "No, we ran it wrong. We have everything we don't need to reset those fields." So John reset the fields, but something messed up with that, so...

**ray.li@llsa.com | 15:51**
Okay, I wasn't aware of that. Is it states aware of that?

**Jennifer | 15:56**
M it probably c CD it's not a big deal.

**ray.li@llsa.com | 16:03**
Yeah, I was in CC, so I wasn't aware, or maybe I was and I missed it.

**Jennifer | 16:08**
I guess. I yeah, I probably haven't sea seed you. I think I've sea seeded stace, but, so far it's not a big thing, it's just annoying. I'll C.

**ray.li@llsa.com | 16:20**
I'm more about the priority and velocity for the pre-registration ad for Konnoscopy because from yesterday's standup, I think DJ probably made some strikes on identifying how to add those four questions. Actually, he said that he wanted to add six because he found the system limitation.
So to me, that means he's on his way to get it done. Hopefully, today or tomorrow. But if we need to take another day or two off, we will. It's just I want to make sure we are aware of it so that... I know the team is going to ask us very soon, so I want to make sure I have the latest information to share with them.
No, I think for this cause purpose, that's perfect. Now that was the right forum to share that update so that we have awareness. But yeah, it would be good to know that. The next question is how we want to... The payroll stuff could be another legacy process that we meet to table and plan for labor.

**Jennifer | 17:36**
It's going to Salesforce, right?

**ray.li@llsa.com | 17:38**
Like it should, everything should happen, but, you know.

**Jennifer | 17:43**
It's going to be on the road.

**ray.li@llsa.com | 17:44**
That it's going to be on the road, but before it's official, so... But I think we get for board meeting purposes. I don't think we need anything else. I have...

**Jennifer | 17:54**
If you hand me the road map. I know how to type things, say payroll software can I can spell it too. Okay, so yeah, I haven't pulled DJ in yet, so nothing's like the only thing that our team has done is Verman did a tiny triage of it on Friday.

**Wesley Donaldson | 18:15**
[Laughter].

**Jennifer | 18:21**
Think Friday, no, probably Tuesday. I don't even know anymore. Earlier this week he did a tiny triage.
But that was it. Otherwise I've been managing it with DBA.
Anything else? Does anybody else want to raise their hands if they want to get rid of the payroll software being owned by us? Yes, that's okay. Sorry. I will talk to you guys all later. Have a good one.

**Wesley Donaldson | 19:00**
Sorry, I posted in the channel, but do we know if the product is able to host the session in nine minutes?

**Jennifer | 19:01**
I, Sam.

**Wesley Donaldson | 19:10**
Do we just cancel that for today? For this week?

**ray.li@llsa.com | 19:13**
I think we can. I don't have anything to demo and I don't know if Greg can demo for today because you just received that, right?

**Wesley Donaldson | 19:22**
And Mandela we deserve the most.

**Jennifer | 19:22**
Well, usually it would be the engineers demoing, but we have a code freeze so...

**Wesley Donaldson | 19:28**
Yeah.

**ray.li@llsa.com | 19:29**
Smoking cancel for today.

**Wesley Donaldson | 19:31**
Sounds good.

**ray.li@llsa.com | 19:34**
Thank you all.

