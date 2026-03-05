# Architecture Solutioning - Mar, 03

# Transcript
**Stace | 01:14**
You... Other... This... Mesley.

**Wesley Donaldson | 01:17**
Good afternoon. I had a chance to connect with Sam.

**Jennifer | 01:21**
Hey.

**Wesley Donaldson | 01:22**
So he's aware of the issues and shared your thoughts on whether we should pull Rinor in.

**Stace | 02:09**
Hello.

**Jennifer | 02:11**
Can you guys hear me? Yep, cool, thanks.

**Harry | 02:23**
Did you see my message about our Thrive versus Cognito? No, down to 1:96, so those 3000 were effectively resolved.

**Jennifer | 02:40**
Sweet, yeah, awesome.

**Sam Hatoum | 02:50**
Sorry about that, my computers are in all sorts of trouble. Yeah, the camera's not working. This thing was made a sign, and I don't know what's going on.
What do you have on the docket today, folks?

**Stace | 03:13**
Well, I think we have a new item that's top priority because I think it essentially blocks everything else if we don't get it right. As to what's going on with blue-green and how we deploy to production without interrupting, repeating, losing events.

**Sam Hatoum | 03:34**
These are losing events. So I'm playing catch-up. I saw some events. I've been in other meetings all day. So I saw the... I've been really trying to catch up on that. Jennifer, do you want to explain to me or anyone what's going on?

**Jennifer | 03:53**
Yes, sure. So that issue that we saw early February where we hadn't been sending emails for a month, it looks like once it was resolved... Well, once we thought it was resolved, it was really only resolved on one leg.
Every single time we changed legs, we either turned it on or turned it off. So emails were working some of the time. And every switch corresponded to a leg switch. So there's something going on with the blue-green that is not in sync.
I don't know what other... If it caused any other issues other than this email issue, but I do know that the email was affected by it. And it worries me just in general about the blue-green because I feel like we've had other issues with the blue-green deployments in the past month or two.

**Sam Hatoum | 04:54**
The other issues being just a quick sense check on that.

**Jennifer | 05:01**
It has caused issues with the admin portal or PDF. I can't remember which one. When we were trying to get those out because we were creating new resources, they were created on the wrong leg and everything was out of sync, and that caused a couple of days' delay for that. What were the other issues?
I will track down some more, but I just feel like a lot of times it's like, "There's something wrong with blue-green." It's said a lot. Those are the two that I can think of off the top of my head. But let me look.

**Sam Hatoum | 05:43**
Okay? I mean, blue green is a very high level item for quite a lot of complexity. Under it like we've got front end blue green, back end blue green. LLaMA, the super graph blue green. We've got the, lambers blue green.
So it's definitely and connectors, there's definitely quite a lot, in the. So I think like overall, like we want blue green definitely to be working well, I agree. I think we've just got a pinpoint like, you know, we're just going through some teething problems, in different areas, I think.
So let's identify those. This one here is about specifically about the way in which I just catching up the way in which we're, the flip flop, I think is like is it was doing a array and that array is not predictable because it's not necessarily.
Yeah. I think that's what I just read from Meho. If there's other blue. So I think what would be really helpful is to identify which blue green. Like, if we can bring them all here, like one at a time, it's an issue, then we can see which one's related to work.
Because, like I say, it's quite a large surface area of blue greens. Like just saying deployments, you know, like it's there's a lot of blue green.

**Stace | 07:01**
But I do think that leads into fundamental design, the system shouldn't be allowed to drift, right? We should be aware.

**Sam Hatoum | 07:11**
Yeah, let's think about this. The drift was in this particular case, you have... Let me read through this one more time, just want to make sure I'm fully intelligently speaking about it.

**Wesley Donaldson | 07:43**
Truff was reating the terministic rank.

**Stace | 07:46**
Which is tricky. I know when I say that, right? Because there's intentional drift, right? If we add a new service, then it's going to be on one leg and not the other, right? They should be true, right?
So we should see... Warning that there's drift go away.

**Sam Hatoum | 08:05**
So the first question is in terms of any missed events and so on, are those in hand? Are we...? Is that being taken care of? Are people receiving emails? Have we got an understanding of the effect and the impact and resolution on those or is that not started yet?

**Jennifer | 08:20**
We have an open PR. I don't believe it's been pushed yet, and it is blocking another P1 issue that we're trying to get out that Dane had put in yesterday that we'd like to switch legs for, but we were waiting on that PR, right?

**Sam Hatoum | 08:38**
But the what I'm saying is like if this has been happening since, you know, a while and there's a bunch of people that haven't been receiving emails, is that a true statement? And we need to send them emails. Or what's going on there with, you know, it.
Like, do we have a set of pending fixes to do like we did last time?

**Jennifer | 08:57**
This was discovered late yesterday evening, late last night. I brought up attention to it. So as far as getting it fixed, it hasn't even gotten fixed yet. Then I did bring up with Ray how we need to handle it, and he wanted to have this conversation first to figure out what we're going to do before we alert the business about the emails and find the next steps of how to solve the data, the previous data, or emails not getting sent.

**Sam Hatoum | 09:39**
Okay. I think there's an oversight here in terms of the discriminator for the blue-green. I'm looking at the step here. One was looking at an array index, which we thought whoever did this must have thought that that's good enough.
But then now was saying that the right approach is to examine the target group which contains "blue" or "green" in the as and not by assuming positional ordering. So looks like the fix is there.
That's the individual problem in terms of detecting it. This or any other class of problem like what kind? I think I ask... Your question stays like, "How do we detect such problems?" It's a tricky way to have...

**Jennifer | 10:29**
So the reason I detected this is because yesterday I was looking into the alerts that were on AWS. There had been some alerts that we had in a ticket that has gone... It hasn't gotten picked up as a P1 ticket, that hadn't gotten picked up.
So I was finally catching up with it and looking into it and seeing where we were on it. I saw this alert was the one that we discussed in the postmortem that was said to be "it was never reset."
So it only alerted us once in December and it was still not reset. So that's why it was still in alert, so it still looked just like it was still the same issue and nobody had reset it. So there's some... Even after we talked about it with the postmortem, when it got brought up there, it was still not reset.
So there's an issue with that as well. Then having these alerts... I think it would have alerted if it was reset, and that would have helped us.

**Sam Hatoum | 11:48**
And so just so re reset happens how? Sorry, just won't run me through that.

**Jennifer | 11:54**
Michel said that someone needed to manually reset it on AWS.

**Sam Hatoum | 12:05**
Just capture some stuff here.

**Wesley Donaldson | 12:11**
Where did you say?

**Sam Hatoum | 12:15**
He said acquire made the toers, and then it's not coming from one leg. Okay, so what are the issues we're talking about here? Can't we talk about blue-green just so we can see, bring them all to the surface so we can see what mechanisms we can put in to detect problems?

**Jennifer | 12:41**
I think we're going to need someone to go through and look and see and identify what issues we've had on blue-green since we've set it up. I don't like there've been a few, but I don't have it right in front of me without going through and getting them.

**Harry | 13:02**
I can recall one or two, so... Correct me if I'm wrong. If there is a new lambda being added, it would default to blue, and if the order of your swaps happened to coincide with that, it was fine.
However, if it did not, then there was an issue.

**Sam Hatoum | 13:24**
I wonder if that's related to this exact issue here, because it's using ordering. So when you say you're saying you had a new lambda, it faults the blue, as in, instead of the leg that's currently active, that's inactive?

**Harry | 13:41**
Yeah, but I believe we're currently broken and we're on the green leg.

**Sam Hatoum | 13:49**
So. So now we're on the green light. You're saying if you create a new Lambda right now, what would happen? It would automatically go to the blue leg.

**Harry | 13:56**
I believe this is the issue we ran into before.

**Stace | 13:59**
So something's not observing the flip-flop essentially. Right?

**Sam Hatoum | 14:02**
Boy, that's what Meho has found is like it was using an index. So you're going to zero or one on the index rather than querying the current ARN seeing what the current value is and using that.
So instead, it was getting a list of ARNs and then assuming that the order is guaranteed, but the order is not guaranteed. I think that's the cause, that's the actual cause. So the fix is to go do that.
But I wonder if that's going to... Or if that same fix is going to fix this issue or if that's yet another place where that's something different. So that's good to highlight us. Thank you. Yeah, blue-green resolution, I guess. Is that what I'll call this in a kind of issue? This is notes when he said... So the effect of this is the notifications events.
Okay, so that we're basically not just not getting events themselves. Are there any other events or was it just a notification?

**Jennifer | 15:12**
From what I identified, it's like this event bus. It only affects certain notifications, not all of them.

**Sam Hatoum | 15:24**
Okay, I can go double. I can have a debrief with you how as well after this and figure some more stuff out. Okay? All right, what else is top of mind, anyone else?

**Stace | 15:33**
C... Are everything created under blue and under green tagged by... Yeah, it should be green like...

**Sam Hatoum | 15:43**
Absolutely.

**Stace | 15:44**
Well, it probably gets even easier with Claude.

**Sam Hatoum | 15:49**
Yeah, I mean...

**Stace | 15:49**
It's like there are kind of almost Python script. I'm looking at this being suggested by just Copilot. We can have a script that can constantly monitor by tag groups the difference in the stack and essentially you could have a little dashboard that's available.

**Sam Hatoum | 16:09**
That's a good idea. Like, just a dash. I mean, I was thinking like I was thinking along the lines of a health check, and maybe those are the same thing.

**Stace | 16:16**
Yeah, I think we're going to the same place, right? Yeah, there's something that should be something that reminds us of, "Hey, you're about to switch legs." Here are the differences between the legs, which was... It's sort of died in our release notes process, right?
But then we can look at that and say, "Yeah, that's what I want." Or "No, what I want."

**Sam Hatoum | 16:38**
Yeah is okay is the.

**Harry | 16:40**
The check the leg check that Rinor added because there was an issue before on the 28th where Rinor added a leg check and then was using that in this fall and this is right around the time of the original implementation. Is that not what we would be using, something akin to that, or could we leverage that?

**Sam Hatoum | 16:59**
Well, fill me in on this. So you're saying there's a link.

**Harry | 17:03**
There's an action that allows you to check what's live, what's not. And I mean it drops something on Kidub for you to read. But.

**Stace | 17:12**
There might be more. That's probably reading the flip flop. That index value, right?

**Sam Hatoum | 17:17**
Maybe. I don't know what I'm...

**Stace | 17:18**
Traversing the whole stack I'm looking at. This is baseball-based on the ACL I described.

**Sam Hatoum | 17:24**
There could be two mechanisms, right? Like the one that's being used for notifications. We know for a fact that it's using some kind of array index and is getting an index and assuming the 0th is the green one, for example.
We've just found out that's a problem. Now I'm hearing there's a... When Net Nu lambers, they default to blue. That may or may not be related to the same problem or the same cause. The root cause.
Now you're saying there's a check of legs on the GitHub actions, which may use a rate index, but it may be reaching out to the... To figure out that way. So there are three potential mechanisms. Or they could all be using the same one. Or they could all be different.
So that's the one thing to unify and check is to make sure we've only got one green-blue resolution like that. Tells you where... And then we should use that one mechanism everywhere. So that's the one area to definitely look at.
Then the other one is if we say both the dashboard and the health check... Right? If we need to power a dashboard and a health check. I think we do that by way of a manifest. I can let's call it an environment manifest.
Inside the environment manifest, it would say, like, leg. Then it'd be like, blue or green, and then it would be like, target, event bust, stuff like that. You know what I'm saying?
We can have a manifest file object that just has all the things we want to know about an environment. So rather than just the leg or whatever, I say like, "Hey, environment, what are you where it goes?" Here's my manifest, right?
That manifest lists everything about it. So then if we ask both environments, what is your manifest? Then we should be able to look at those side by side. So, green manifest, blue manifest, everything inside it changes. I think in addition to the change log, we'd have an object. It's like the current state of this environment. What log group is it pointing at, what environment, what leg, what LLaMA, what leg? Just a big old manifest of stuff, right?
It's almost like the cloud formation, but the equivalent of a functional... What do we need to know? We can just keep expanding this object with stuff that we need. I think that might be the way.

**Stace | 19:42**
Yeah, I think the other intricacy we might not have planned for from an observability standpoint. Maybe this is an opportunity where we just handicap centuries so it can't tell which leg it's getting data from.
Yeah, from a Claude Wassh standpoint, right? You're going to have LLaMA, green, Lamb, and Defou blue. They're each going to have an alert, but one is always going to be not prod, right? So you almost have to draw a funnel onto a higher level that contains the alert.

**Sam Hatoum | 20:18**
Yeah.

**Stace | 20:19**
Right. So that might be that we have observability, but we're switching it on and off depending on which leg we're on. It's not the active leg. We don't want to wake people up at 3 am if it is the active leg. We do. I don't know for centuries.
Do we care? Do we just send the data, the century, and we find all the uncaught exceptions because they're bad, whether they're about to go into prod or in Prague. That way everything's there. Or do we leave that level of complexity and century, and we have to sort out, "Here's a bunch of errors, but they are on green. Here's a bunch of errors on the blue. Are they the same? Are they different?"
We might want to think about that as we scale.

**Sam Hatoum | 21:05**
Yeah, there are a few different ways we can do that. Like one is the initial log coming out could contain whether it's live or not. That would mean that everything that logs has to be aware of. It's...

**Stace | 21:15**
Yeah.

**Sam Hatoum | 21:15**
You know, whether it's live or noture.

**Stace | 21:17**
Sounds not live.

**Sam Hatoum | 21:19**
Sounds wrong to me. Like a thing shouldn't know where it's been deployed, you know what I mean? Whether it's blue or green, it should be oblivious. The lander shouldn't know whether it's live or not. They should just say, "I'm blue and I'm just... Yeah, I'm doing blue things."
So I think that's probably not the right place. Then the next level up, we can say when the log aggregator receives it would know like it says, "Okay, it has some conditionals." So let's say in Century you can put a conditional report gathering which says, "I'm collecting blue and green, but I'm only going to alert on the condition that the log is blue and an error and the current active thing is blue."
So you can have some built-in stuff into Century that could do that.

**Stace | 22:02**
Then I guess there's a play, right? It doesn't make it as far as one of the legs unless a production release is imminent, right? So I guess maybe the answer is we could decide we care about both equally, because even if it's not active, it might be soon.
If there's a right...

**Sam Hatoum | 22:19**
Right, that's all, yeah, just keep it all clean, basically, is the idea just like, "Receive your order and keep it all clean." That sounds the best in terms of the least amount of work, but in terms of creating the best practice so that you keep everything squeaky clean. Does that solve what we're looking at here?
If you like detecting new drift and new problems, what would you want to see in this manifest? Like, if I go to an environment and I want to know something about it, how would that even have helped us find this specific problem? Let's just stress test stuff.
If I can go to an environment and I say, "Give me all the things I know you are." All the known things about you. What information would have told us that? We're not sending notifications right now.
I guess some kind of last sent event dates, something like that. We've got the event store, obviously, that can tell us where everything is, but from that environment point of view, in this specific case, if we're looking at these notifications were not coming through, it could be a case of... For all the services for all the connectors, example, last status, yeah, some health check of every service that's inside it.
So if there's the notification service, which is sending things to a bus, last sent message, that will probably be enough, actually, because if we just say last sent message two months ago, that's probably bad news.
Well, I've seen a last activity, even if it's just last activity for a specific thing. Again, we just now enumerate all the things in that manifest that would tell us for sure.

**Harry | 24:22**
So this would be every LLaMA, every VT bridge call?

**Sam Hatoum | 24:32**
Yeah. Like, what do we determine is activity at that point? Like we could split that, let me share my screen and just like, hack on something.

**Harry | 24:48**
I remember we went down this road before and it was like, "Everything's working from the Thrive perspective, but it's when you know it."

**Sam Hatoum | 24:57**
In particular.

**Harry | 24:58**
The email thing, it's like a VT bridge message actually just got parked, sat in a deal queue.

**Sam Hatoum | 25:09**
So if we just say, if I say activity over here, something like this and then under the all the braces. Actually, it's just... Okay, I still work for myself, but if you say under activity, I would have notifications, and then it could be, let's just say, an hour date.
Then what was the other one you just mentioned, Harry? Other than notifications?

**Harry | 25:37**
So Van bridge.

**Sam Hatoum | 25:38**
I guess. Yeah. Event bridge like you lost activity. I mean, it could be a date, or it could just be another object underneath this which says, "Last activity." And then something like the number of events, the number of accounts in the last week.

**Harry | 25:59**
We don't have... I don't know that we have anything currently monitoring the DALL-E cues because they're not... We treat them as DALL-E cues, but they're just cues sitting there. So in the ordinary processing of things as they go, if something fails for some reason, it just gets dumped into a queue so that someone could go manually resolve it later.
So it would probably be a queue size or something like that would be valuable.

**Sam Hatoum | 26:24**
Yeah. So what would the different DALL-E give me? One or two examples of DALL-E queues that we have today. I gotta look up. It's a handful of different ones. Right? We've got 1D queue for...

**Harry | 26:39**
PDF generation.

**Sam Hatoum | 26:40**
You've got... Okay, cool, that's a good...

**Harry | 26:43**
1D was the SQS, yeah, I'll get...

**Sam Hatoum | 26:49**
You listen now, but let's just be thorough. So then you know this would be size because do we clear them then once we deal with them, we clear with the size, right? So that should be theoretically cleared and going down.
Should we want it to be zero all the time?

**Harry | 27:05**
Yeah, exactly. So we've got...

**Sam Hatoum | 27:08**
Actually, I'll check it up and I'll just drop in here.

**Harry | 27:10**
Give me a list, because these are the long names.

**Sam Hatoum | 27:13**
That's okay. I mean, I'm trying to get what this manifest would look like for us right now. If we shape it up together now, and then we say, "How can we look at this and see at a glance that we have an issue?"
If this was a dashboard always running somewhere on a visibility dashboard, that's what we'd want to look at. So I mean this is like...

**Harry | 27:39**
I remember we chatted about this before, and I mean something akin... I remember back in the day it was the old KFANA thing, and you just watched them do their SW.

**Sam Hatoum | 27:48**
That's right, this is the dashboard slash... We could use some of it for health check. That's the other point. If we want to... Sine wave... Do you mean like...?

**Harry | 27:58**
Well, people things happen in the morning, maybe they both...

**Stace | 28:02**
Yeah.

**Harry | 28:03**
Nothing happens at night, and when you see a break in that pattern, you understand visually that something is wrong. We remember we just ended up defaulting to having the Knox Center just have that on TVS.
It's rudimentary, but it works.

**Sam Hatoum | 28:29**
So at the very least, the basic stuff is like whether it's active or not, what leg it is when it was deployed. We've got the DLQS I think that's super useful there. And then would that like at this point, would we have detected this most recent bug?
That's the first question. So going back to this here, the bug notification events on Event Bus that didn't create any d LQS, right?

**Harry | 28:53**
No, I don't see, no, I mean, there's a Shopify legacy web hook with 40 in it, but everything else is empty.

**Sam Hatoum | 28:59**
Okay. It's good.

**Jennifer | 29:03**
There was an alert and a ticket created to Chu into the alert, but we didn't have people picking up that ticket, so technically, it should have been taken care of.

**Sam Hatoum | 29:20**
Well, what when you say that, like, what are you...? Like, is this it? It should be a developer looking at it. It should be like, "How does that get into the work of developers for someone to look at it?"

**Jennifer | 29:36**
It's like when tickets are created, a P1 ticket, and it's at the top of the queue of the Conboard, it should get picked up.

**Sam Hatoum | 29:46**
Okay. You know, definitely the.

**Wesley Donaldson | 29:48**
I...

**Sam Hatoum | 29:48**
So that P1 was not picked up as what you're saying happened as part of Mandalore or Andrea. Okay.

**Jennifer | 29:55**
Wheres what happened?

**Wesley Donaldson | 29:57**
Is? Six is that six four? Jennifer.

**Jennifer | 30:03**
Let me check. Sorry, yes, 6:04.

**Wesley Donaldson | 30:11**
Yeah, I connected with Meho on that, just asked him what the status was, so I don't think I pushed it with him, but it's assigned to him, and I pinged him on status on that.
That's on me that I didn't force it forward. The last comment didn't read that as an immediate next step, so it should have been, in the worst case, removed from the board.

**Sam Hatoum | 30:32**
I mean, but a fair call out was created on February 19th, and it's still a P1 today. That's definitely a fair quarter. That's an oversight. So the next thing to do is to look at P1s on the board right now.
Are P1s surfacing to the top of the board every day? If I go to the board, then this P1 was visible on the board every day, and it wasn't dealt with.

**Jennifer | 31:01**
There was a lot of focus on the recurring stuff, and I think that focus definitely clashed with any P1s. So I think there needs to be a better balance while we have big projects and pushes going on.
I think we just need to be aware of the P1s.

**Sam Hatoum | 31:29**
Well, I mean, okay. Is it...? Is it that we're getting into a slightly different conversation than the architecture...? But I would just highlight this: there needs to be a scoring system that is just sacrosanct. P zero means drop what you're doing and fix it. P one means finish what you're doing and fix it. Everything else works as per priority.
If you have something like that, then it's a very simple formula, including recurly or otherwise. P zero means hairs on fire. We're bleeding, we're losing money. Customers are something terrible is happening.
That's P zero drop what you're doing and fix it. P1 doesn't matter what's going on whether there is a recurly or otherwise. This is important enough that the product owners/team leads have deemed that this is important enough to... When you're done with whatever you're doing, please jump onto this because it's that important.
It's not drop what you're doing and fix it, but it's finished what you're doing and fix it. That is what I would say ASAP 1. Anything else... It's basically just prioritized on the board accordingly. If we follow those rules, then I think that's a much easier rubric than...
Recurly is more important right now, so we can ignore P1 and P zeros.

**Wesley Donaldson | 32:43**
It's more than fair.

**Jennifer | 32:44**
I think that's a big call out.

**Stace | 32:47**
So can we what's the appropriate team meeting to really enforce this with everyone? Friday's Engineering demo.

**Sam Hatoum | 32:57**
Yeah, sure. The way I've done it normally is... Instead of having just one expedite, I'm looking right now at the board. Let me just share my whole screen. Sorry, I'll share my whole screen, but the way I'd recommend doing this would be... The board would be... Right now, it's just expedite instead. I would have a critical one and then another one which is urgent, right?
Then everything else. And so critical means if you see anything in there, it literally is like drop what you do and fix it. If you see something urgent, finish what you do and fix it and carry on. Everything else is priority.
Then let's just do that. I think separate the board into two separate lanes because then, you know, the top one is like... I think you can color code them too. Maybe if you can, then I'll make that red.

**Jennifer | 33:42**
Yeah. And I was going in yesterday to see if it was still a P one and found it was. So that's kind of. And then I was going to call it out to the team to, like, look into it today.

**Sam Hatoum | 33:54**
Okay. Was it just curious about...? Is this it? Here or here is the same one? No, this is just high priority.

**Jennifer | 34:02**
That's what I... So the other wants... Then this is the one that I created because of finding it.

**Sam Hatoum | 34:10**
Sorry, so that's issue 06:04 West 06:04 on here. I'm just now curious about all this because...

**Wesley Donaldson | 34:17**
It's...

**Sam Hatoum | 34:17**
Okay, so this is the 06:04.

**Wesley Donaldson | 34:18**
Introduce. The one right there?

**Sam Hatoum | 34:20**
Okay, now let's just look really quickly at the activity on this one. Was it always visible on the board or was it in... Was ready for dev and then it just stayed here from February 19 and ready for dev which is that the to-do column like that there's not priorities that does that to-do is that to-do equivalent to ready for dev, yes.
So, okay, I'm just looking at the status. Yeah, ready for dev right there. Okay, so it would have always been visible here, but it's just like... Yeah, again, I would say that's because you can see here, like, are these all P1s or what?
These opp ones, right?

**Wesley Donaldson | 35:06**
Yes.

**Sam Hatoum | 35:07**
What I can tell you is that you already have this as... This is urgent, this is critical, and this is urgent like that's just different language, but this is P1s expeditise P1s and priorities P1.

**Wesley Donaldson | 35:19**
Everything that's in priority is basically inside of, is inside of expedited. Maybe that's a P1 and a P0 as well.

**Sam Hatoum | 35:27**
Just the port configuration here. To filter these tows.

**Wesley Donaldson | 35:35**
Go to Quick Filters. Open the left rail board settings then. Yeah. Layout Quick Filters.

**Sam Hatoum | 35:44**
Thank you.

**Wesley Donaldson | 35:44**
So.

**Sam Hatoum | 35:45**
Yeah, I mean, that's it, priorities in P that's basically what they are. That's exactly what they are, right? Those are drop what you're doing and fix it. Those are finish what you're doing and fix it.
If you prioritize accordingly, then it will work out. If P1 is not used with... If you're not ultra tight with that criteria of how to deal with priorities, then you end up with things like expectation slipping.
But if you're just absolutist with it, P0 drop what you didn't fix it, P1 finish what you didn't fix it, and everything else just prioritized accordingly by order on the board. Do that, and then that's how we get around this problem.
So very fair call out, Jennifer. 100% agree, and I think we just need to tighten up how we deal with these. If something here shouldn't be a drop what you're doing and fix it, and sorry, finish what you're doing and fix it, then it should just move into normal priorities down below.

**Stace | 36:39**
Yeah, I think we're going to address this through process and just stressing or enforcing the team. I think what worries me a little bit more is the potential gap. Before that, there's one thing once we know there's a problem in getting it out the door, the second problem or the first problem is really the situations where we just didn't know there was a problem for weeks.

**Sam Hatoum | 37:02**
Yes.

**Stace | 37:03**
That's you got to build to catch. Yeah. Again, now is the time to really... The next month or so. Whether we have gaps in observability through monitoring and the pipeline problems, we really got to get that out before commerce, right?
Because commerce, we're just not going to be able to have these kinds of blips that slip through the cracks when it comes to orders and payments and things like that. Lu Early is doing the credit card integration.
So that's the financial thing. But again, we could have the same sort of problems, right? If we're charging people that something on our side's failing and the orders never get recorded and recurred, then we can't...
It's not there to get it out right. But we've already charged the person that... It would be really bad. If it makes a new recurring, that's good. There's a little... We'd have some catch-up in getting the order re-curly, but things could start to go wrong. They're really fast, too.
If that's delayed by more than a short period of time, right? Because that means we'll be selling time appointments so that order can't make it out of recurring. We're going to release those times and double sales slots.
If that were delayed half a day or a day... The business makes decisions by the hour on ad trafficking to fill things up. If they think things aren't selling what they are, right, they're going to make the wrong decisions. There'd be a lot of downstream problems all the way to a terrible customer experience.
If you show up at the appointment thinking you have a reservation and you paid and they tell you you don't.

**Sam Hatoum | 38:39**
Okay, so we've spoken about a few things here where there are a bunch of problems to analyze over here, right? So we've got to figure out what's going on. I think this issue of the current issue of events not getting on the bus...
I think that's like a resolution like PR already or PR in progress. I'll just say that I'll be... We've just spoken about two potentially related things like this one here. Uses wrong index resolution we got it uses index for and that's what we just deemed is not correct. This is wrong and we want to make sure these guys are using the right... Make sure this is using the right resolution and then same for the action.
So just two items there to investigate and make sure that we're not using the same pattern, and then just to say sweep or anywhere else that we might be doing leg resolution to see to make sure we're not using arrays.
Okay, that's for the current problem that we just found, which is today we're calling blue-green resolution. Okay, one issue highlighted it. We need to make sure that the surface is not impacting other places, and we'll go from there. Go ahead.

**Wesley Donaldson | 40:10**
Miao mentioned that there is already a check inside of the leg switch job that tries to resolve the differences and just a security checker. He flagged it as being buggy.
I think figuring out what the definition of buggy, what was the intention behind that, what was it trying to solve was a good line of investigation.

**Sam Hatoum | 40:29**
Yeah, I think that's what he's talking about here. I think this is it. The user index for resolution. I think this is actually what he found. That's what the PR is that to fix... My... What I'm wondering is we know of two other places that require resolution. We need to investigate if they're using the right approach and then sweep for anywhere else that we haven't spoken about today.
That is really needing resolution to make sure it's not using the flawed index approach. Right? So that's for the resolution of which is the active, which is the leg like the blue and the green. The other problem we're talking about is how do we detect these earlier and other problems that might drift, right? We can drift in terms of new code coming up, but we can't drift in terms of regression. Really, that's what we're looking for. We don't want to regress in functionality.
So one of the things that can help us do that... Observability is what helps us because we should see things drop and go up and so on. But here's... Let's brainstorm those options. We've come up with the concept of a manifest, and I think that's useful, especially if we want to get visibility into what's going into the queues.
That's definitely a useful thing for us to see. The other thing that's useful to see is activity, health activity. That just tells us as if I look at this... We expect this activity here to have happened within the last X... Actually, maybe that's the better way to do it. Activity. Health is another way to look at it.
Instead of defining here like last activity, which nobody knows what to do with, we instead define a threshold. So we would expect, for example, on Event Bridge, at least one event every hour or every day.
So if we define a threshold, then this can basically say healthy or unhealthy because it's not on that threshold, right? It could just be a warning for us just to go look at rather than failing. The system was like, "It might be normal. We haven't received any orders because it's Christmas in an hour."
But on any other day, every hour, we expect an order. So at least it can show us that kind of stuff here. So that's I think what we can do is threshold. Yeah.

**Stace | 42:29**
Go ahead. Depending on where you define those thresholds again, if it's done through CloudWSH, they have anomaly detection, which is dynamic threshold, right? It learns.

**Sam Hatoum | 42:43**
Right?

**Stace | 42:43**
That's really low at 3 am and at a certain rate at 3 pm.

**Sam Hatoum | 42:48**
But then what we could do here is not only have this manifest process.

**Jennifer | 42:52**
That that's the alert that we saw. It was the anomaly one.

**Sam Hatoum | 42:59**
So there was an anomaly alert that told us this is the problem. We raised the P1 ticket a month ago and then it sat there, and that's the issue you're mentioning, right, Jennifer?

**Jennifer | 43:09**
Yeah. So I think there's some anomaly learning. I think there's definitely some room to improve and to add more of them. But I'm just calling out that, yes, I think the anomaly report like alerting is what we should do because it does seem to work.

**Sam Hatoum | 43:26**
Well if we then in that case, like let's make the anomaly detections job easier, right? Like if we get this manifest and we just like poke it to the as a log entry itself every, you know, ten five minutes that in itself would then be. Would have anomalies in it.
That I lose the room on I want. Or did I lose my connection?

**Harry | 44:02**
Say the last part.

**Sam Hatoum | 44:03**
So we got this... We're talking about the environment manifest, right? It's basically got a bunch of stuff in it. It's got a bunch of queues in there, right? It's got, for example, here, if we say activity, right, like activity, health, so notifications, it'll be like, "Let's say it's five, four, and then next time it's five." Next time I report, we send this to CLOUDWATCH, and it keeps going like this in terms of its data, right?
It's like flipping around air around. This sort of range, and then at some point, it goes to 100, for example. It's like, "Wait a minute, something's wrong there." Yeah.
So we're helping the anomaly detection by giving it a payload that contains succinct information that we just keep poking it with over and over again. We can look at trends, but we can detect the trends because that's what anomaly detection does.
Yeah. So, it's if this is just reporting the values. Yeah, and basically, the thresholds become a logging concern.

**Harry | 45:06**
Yeah, 100%. As you're just comparing the previous to the next.

**Sam Hatoum | 45:12**
Yeah, exactly. So then in that case, notifications in the last hour, for example, that's what that value could be, and that's what makes it easier for anomaly detection to know that's an anomaly.

**Harry | 45:34**
But I get super clever and do a moving average built in.

**Sam Hatoum | 45:41**
Yeah, don't be too clever if we confuse it. I don't know the capabilities of like whether this needs to be anomaly like as in automatic anomaly or whether we can just like define our own threshold at that point then, like presumably f just.

**Harry | 45:59**
I just have it as a static count is just a good first step.

**Sam Hatoum | 46:05**
Okay.

**Harry | 46:06**
Because calculation anomaly... I mean, we can already see it in what we try to do with what Amazon gives us is its own trial and error but having something we can just look at is immediately available all the time will be useful because everyone's gonna eventually have an intuition of what it's supposed to look like.

**Sam Hatoum | 46:28**
Right? Right. Agree. Okay, so this is the other thing that we're talking about is the dashboard to view this data. Or we can expand this as we discover new things, we can expand this object to have extra data that we need to help us resolve things.
So that's a good observability dashboard metric that we can add. Then how we get this data in there now is a second question, second concern. But the very real is like, "Let's start with an endpoint that we can hit that shows us this data and then be able to send that data as a payload to AWS."

**Jennifer | 47:07**
How does this alerting and logging and everything fit in with Senty?

**Stace | 47:18**
I think they're slightly different, but complementary, right? So... Century, so I've got this wrong, right? At least what I've used in the past, it's less of an monitoring, alerting, and response system, but it's going to tell you what's wrong with your code and when you do have an issue where it probably is...
It's great for knowing uncaught exceptions, right? So there might be bugs that our users see that we don't see, right? And that you find this by chasing uncaught exceptions. But Sam had different experiences with it.
I think it's saying more of like it helps engineers diagnose the code, but it's not really the best tool to alert the business there might be a problem.

**Sam Hatoum | 48:00**
Yeah, it's yeah, exactly.

**Stace | 48:02**
So but they're complementary, right? There's a problem in the code. It's probably a problem in the business, right?

**Sam Hatoum | 48:05**
So I mean then in that case, is this something we want to send to BI then as well? I guess again, so that's the same kind of question like how some metrics.

**Stace | 48:16**
Right? Everything about like blue green things like that.

**Sam Hatoum | 48:21**
They won't care.

**Stace | 48:22**
Yeah, right, I think that isn't cloud-wash. There are other metrics we could look at like we are doing this on the results side, no one got our results ready today, right? Because that's a KPI we look at those and they can alert on that. I don't think we have to discern those on our side. I'm trying to get them to pick up the emails too, because there could be problems of deliverability even if we are sending all the right events.

**Sam Hatoum | 48:46**
So well then we keep that separate. I think you...

**Stace | 48:50**
I think you look at sales per day like that type of anomaly detection could probably be on the BI side and we look interesting it fails.

**Sam Hatoum | 48:58**
And availability when we look at something like the trend of notifications, let's say in the last hour like you know, it's an average notifications the hour let's say that hovers around a hundred and then that drops when we do a blue green, we definitely want to know about that.
Like that's, you know, that's a. And then similarly with sales, right? If sales suddenly dropped like that as well, that would be an impact for engineers to go, "We just did a blue-green switch, and that coincided with a drop in sales. Something's very wrong."
So even though it's BI, it still can be very relevant to engineers, especially if it's coincidental with deployments.
Makes sense. I think we start with just this. Let's just start. We're going to have a lot of things in the event store that we can get out into here. But let's start with the thing.

**Harry | 49:58**
Go ahead. I'm just adding to that. I'm not agreeing 100%. What's caught us out before was it's like the boundary of Thrive, right when we go and we start relying on our external email provider or right when things look all great from our perspective and then they go to interval. Turns out the journey was never turned on to me.

**Stace | 50:19**
That's what I said. It's two parts, right? So email... We should understand if maybe cash if the queue is down, right? The dead letter queues fill up. We haven't processed it even this under... But that's not the business's story, right? I'm trying to get product marketing on...
Well, it's your job to understand that those emails all out and not enough people opened them, they even have bothered sending them in the first place, right? We're even finding that with some of our results delivery things.
So we're like, "Great, we sent ten emails, that's good enough." But if only 30% of the people opened the emails to begin with, and it's probably not the right path, but... So I'm saying it's a two-part thing we need to own our system thing.
But the business has done some of their metrics too.

**Sam Hatoum | 51:06**
How can we...? If that's a great point, though. You're raising there like, Harry, like if we talk about like our Thrive activity health and like, yeah, of course we've got a bunch of information here that we know.
But for example, things could be going to Event Bridge just fine, but it turns out somebody's modified, let's say, the payload shape that goes into Event Bridge that then stops it from going to Itovol.
And now we're no longer getting emails out, right? Like there's a sort of like as external system integration's health where like, you know, we'd want to know about what the happenings are within recury, within Itriol, within Cstar on both the receiving and ascending side.
Like, it's a tough problem to crack, but like what? On the incoming side, it might be easier to solve. Like, probably easier to monitor on receiving, but once we send, it's kind of a black box, right? We send in and it's gone and we don't know what happened.

**Harry | 52:01**
Yeah, you could add in there like, I mind spot, I'm not sure. I think what you've got so far is good, and then we can identify that anyway.

**Sam Hatoum | 52:16**
Yeah, just brainstorming here altogether. In terms of next steps, like picking something out, I think we start with a single like object payload that we can start with. We agree a single one that we can say this is our first iteration. Then we can go for like move forward. I like the idea of having at the very least the DLQS in there like that should be surfaced tomorrow.
You know, like we need that. And then the other one is just number of things in a time frame, right? And we can just pick a bunch of those because that would actually have highlight that would have highlighted this problem. The about the green blue resolution would have showed up there.
So that's definitely something that would surface problems. I think we can punt this like in external integration health. Like, it's an interesting concept. It's probably more of an art than a science right now to come to think of something, but definitely starting with a set of activity, health, and the DLQS.
So if I just shape this up here, we've got some metadata, environment metadata over here in this object, we've got the DLQS and then we have activity trends. Actually, it's not health, it's just activity trends.
If we just have an object that comes out per environment that we can then view in a dashboard and send to AWS regularly, that's a great stock.

**Wesley Donaldson | 53:43**
What do you. Can you say more? What you mean by sent as you mean like an alert within AWS lo.

**Sam Hatoum | 53:49**
A log entry. So send the manifest ready to. You know you can help that. Log to the let me say this send send as log entry to AWS regularly like ev every.

**Wesley Donaldson | 53:59**
Could it be an option where Century can interpret that log and maybe does the intelligence detection and anomaly detection over time? Is that valuable there?

**Sam Hatoum | 54:08**
Well, that's exactly what that would be. Here is like now we can rely on AWS as anomaly detection. I mean, we could do Century, but like I think start with AWS, then we can figure out what to do Century.

**Wesley Donaldson | 54:21**
Makes sense.

**Sam Hatoum | 54:23**
Alright, you've got five minutes. I want to talk to you about one more thing then, which is that we can help us catch problems early. That is this LLM commit validators concept. So on my machine, if I just quickly open up this, I've got this validators.
So if I just open up one of these testing structures and it says, you can see it says a or AC it's a commit validator. So what it does, it actually stops the LLM from committing files. And it says "no back if multiple execute verify in one cycle check property that like just some validators about test structure and then act if this looks good." Same thing over here with stubs over mocks. I don't want to use mocks, I want to use stubs.
I have a commit validator. So what happens is an impartial LM will start when I do a commit and an impartial LM starts up, it receives one of these basically the agent and it does an act or an act on that commit.
Right now we can actually do that to humans too, as we try and commit stuff locally. We would run ChatGPT minus P and we'd have a bunch of validators that it checks. If those validators are good, it'll take a few seconds for it to run. It'll say, "That's good."
If not, it'll stomp you and say, "Don't do that." So now that that's the concept here is in action, if I just show you, there's the valid data, if I show you the actual logs, I find the...
Okay, so here we go. This is it. This is one Claude stomping, another Claude saying with a hammer saying "create settled workflow factory from the operations but the diff only." Blah, this is wrong. Another one here it says "new code requires tests."
It's like you've got this branch, it didn't have tests and so on, right? The other's got or get X. The other interesting things is you can run them in parallel. So I can have three different Clauds execute doing five, six validators each.
So they can run multiple validators at the same time. Go ahead, let...

**Wesley Donaldson | 56:22**
Jeff, how just definitely... Gico had mentioned using bug but as a mechanism here. That's one question. How does that relate to your thoughts on... Is this correct? Me, if I'm wrong, your thoughts are like this is correct. Me, if I'm wrong, your thoughts are like this is for the catch-up plan, allowing the LM to run independently with developers actually being the ones. How would you imagine this being? Is it just a pre-commit hook that we'd put in that uses the...?

**Sam Hatoum | 56:48**
That's it. It's just a simple pre-commit hook that runs ChatGPT minus p with the validators. That's all this is really right. Most validators I just have specifically here though, like the things that we often forget. What we can say is for changes that are in given files, directories, or packages.
So that could be the infrastructure package or it could be, as you know, a LLaMA or whatever. It can basically say, "Have you taken care of observability and have you updated the manifest to include information that we need?"
We can add these. Don't take these into... To be precise, but that's what I'm saying. We can just have a bunch of validators that can tell us whether or not this commit needs attention. Does that make sense? What do you guys think?

**Yoelvis | 57:33**
How long does it take to run?

**Sam Hatoum | 57:37**
Not long at all. I mean, look here, you've got three validators. I mean, so these ones here, like look at a 15 like go tw ten seconds. Sorry, that's. I'm not doing math. 15 s for these ones, but that's because they're running quite a lot, right?
If you just ran down two.

**Yoelvis | 57:56**
It's like. I usually hate when I have to wait, like, a lot of time to commit the a change. It's like so bad experience in general, but I think maybe we can put it in the pre push. Pre push could be slightly better.

**Sam Hatoum | 58:11**
Exactly I mean just use husky like yeah, exactly like we've got you know we've got pre push, pre commit, pre post commit, you choose. Yeah, hundred percent that's a good push. Yeah, and it really this is less about failing the commit, actually.
So like make this make sure this is clear doesn't fail commit, but, you know, produces report plus warnings. That's really what it should be, right? Because as a developer, you just want to know, and you can look at it, you go, "No, that's fine, right?"
Commit it like it shouldn't be a blocker. It's not like you've done a... You're not... You've broken a test or anything like that, but it's just a reminder, and I think it's a very useful one. The other thing you can do is instead of even a pre-push, you can actually do it on a pre-commit and then just do it as a fire and forget.
That's another way for you not to... So then it just runs in parallel to everything else... And forgets asynchronously. Then it comes back and gives you that report before you commit as well, so that it's always running in parallel to everything else. There are different techniques.
So I just wanted to highlight that it's not... I wouldn't look at this as something that's going to break the build more. It's just a warning. Alright, I'm going to send this over to... Set of notes.

**Wesley Donaldson | 59:37**
Please.

**Sam Hatoum | 59:40**
And so in terms of scheduling, are we good then?
Like it sounds like this dashboard is a high priority for us to get done in and coming like what what's the time frame when to get these done in?

**Jennifer | 59:53**
You mentioned that you guys might have some time frame up. So think that this could fit in the next couple of weeks.

**Stace | 01:00:03**
Yeah, I think now is probably the time to do it, right? Because we... We can begin the scaffolding and getting orders out of recurring and kind of corruption layer. I think we already decided that's only enough surface area for the most two people. Do you think it may be leaving one person to continue to it on the store?
I think you've got a couple of bodies to fix this. Great.

**Sam Hatoum | 01:00:27**
Okay, so... I'm going to send you this. I've got a lot of context in my mind as well. Pull me to the point when we actually do engineering takeover and so on. We can flesh this out better.
I think over here the group got a good understanding, but I think it would just make sense to really pin it down once we actually specify our tickets.

**Wesley Donaldson | 01:00:44**
Sounds good.

**Sam Hatoum | 01:00:48**
Alright. Do we need anything else to discuss? Do we need any follow-on sessions to discuss anything else that's urgent? Or we get to next week for the architecture session.

**Wesley Donaldson | 01:00:59**
I think in Sam, you'd propose like doing a developer session.
I think Antonio and I were just kind of going back and forth and refining out in more detail to those like here's what.

**Sam Hatoum | 01:01:07**
Do that.

**Wesley Donaldson | 01:01:07**
Yeah. So that's probably not until... If you're still pushing to have it done this week, it's probably Friday-ish. Does that sound about right, Antonio?

**Sam Hatoum | 01:01:16**
Do what you need to pull me in if you need to. I just have a lot of context. If the context of today's... If the notes I'm going to send you and this video were not enough, pull me in and I'm happy to help.

**Wesley Donaldson | 01:01:25**
Sounds good.

**Sam Hatoum | 01:01:29**
Okay, thank you. Alls see it?

**Wesley Donaldson | 01:01:30**
Thanks a.

