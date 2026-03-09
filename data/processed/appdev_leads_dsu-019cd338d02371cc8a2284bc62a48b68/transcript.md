# AppDev Leads DSU - Mar, 09

# Transcript
**Jennifer | 01:12**
I don't know if anyone else is joining because of... So if we want to get started, I just heard from Ray this morning that we have a higher than normal call volume on Thursday. So I've been looking in Century a little bit to see... I actually had already started looking at Century because I had noticed a spike on Thursday of last week. I'm not sure if we ran any extra events that day. It looks like after Blue-Green turned on, or if there's something else that could have caused it.
Or just Blue-Green going on... I'm getting fixed... Caused it. So I'm going to see Wesley if I can work with him to see and diagnose exactly what's going on and make sure there's nothing that we need to look into.

**Wesley Donaldson | 02:05**
Yeah, so he's been reprocessing events for the better part of the back half of last week. So Thursday, Friday... I wonder if there's a relation there. So those were...

**Jennifer | 02:20**
It could be.

**Wesley Donaldson | 02:22**
Yeah, the parked events as well as the events coming out of the Blue-Green miss.

**Jennifer | 02:28**
I thought so. I think he had said that the events that he was reprocessing didn't have anything to do with... Or would not have any side effects that would send emails.
So I'll work with him and make sure that we didn't... See if we can't track that down.

**Wesley Donaldson | 02:49**
Yeah, Harry, one of my stats for today was that he was supposed to be reaching out to you specifically on the non-PDF related events that he's looking to replay today, and just confirming that any of them will create a notification or email back to the user.

**harry.dennen@llsa.com | 03:06**
Okay. I haven't heard from him yet. Do we know what the calls were about specifically?

**Jennifer | 03:16**
Right now, I'm just seeing... I haven't dug down enough. What I've seen so far is a little bit of everything, a little bit of higher events. There is stuff with logging in, but that could all be due to...
If they got their results like email, then they would be trying to log in the next day if something had triggered all of the results emails on the fourth. So it could be a lot of different reasons for anything that we're seeing, and I just need to see where it started and what happened.

**harry.dennen@llsa.com | 04:04**
Yeah, my deletion scripts only started on Thursday evening, and that was a small run of a thousand. Then Friday was a big run Friday evening, so that would have been too...

**Jennifer | 04:18**
I'm seeing the biggest spike is on Thursday at 8utc1 here, which would be three Easter. Sorry, I have to go that way. 03:00 pm Eastern on Thursday and what time? There was one on Wednesday. There is a spike in the morning.

**harry.dennen@llsa.com | 04:47**
These are CL CER spikes or century air spikes?

**Jennifer | 04:50**
These are just our event spikes. I haven't looked at century errors, but if we have a higher number of events, I assume that's what the call center is. I doubt it's specific errors, and I bet it's just volume.
Yeah, that's what I'm seeing.

**harry.dennen@llsa.com | 05:11**
The only other thing I think of is it would be the replay. But I don't know that he was doing... I think because we only got everything resolved on Thursday.

**Jennifer | 05:19**
I think we did. Wait, hold on. I looked it up because I wanted to see where I found that. Thursday midday is when I said I was going to reset the event bridge alarm. So we... I think we fixed it. Yeah, March 4th in the late afternoon/evening, it's like evening time. Wednesday is when we fixed it.
So that's why I could see Thursday having a spike.

**harry.dennen@llsa.com | 05:52**
Yeah, it makes sense.

**Jennifer | 05:54**
But it like we weren't expecting a high number of emails to go out when we fixed it.

**harry.dennen@llsa.com | 06:01**
So do we know the number of emails? One.

**Jennifer | 06:07**
No, I haven't checked yet. I need to do that.

**harry.dennen@llsa.com | 06:10**
Because there were a set of conditions where that recursive loop on PDF generation could trigger emails, but they would happen seven days after the loop occurred. So it's a potential that... Did anything happen a week before?
Right, so we have the seven-day...

**Jennifer | 06:41**
Yeah.

**harry.dennen@llsa.com | 06:42**
The recursive bug, that was the insidious bit about it is that it would produce these events, but they're on a seven-day hold, so the actual email doesn't show up for seven days, so you could end up with a bulk...

**Jennifer | 06:56**
Did we not clear out that scheduled event?

**harry.dennen@llsa.com | 07:07**
I don't think so. I'm not aware of that.

**Jennifer | 07:14**
When you say it's like a recursive like it would it send multiple emails under person?

**harry.dennen@llsa.com | 07:23**
Yeah, it's possible. So there are conditions, right? So they would have to be all results approved. They would have had to never looked at their results and they would have had to have triggered a PDF so if they had purchased a paper or there was an elevated result, it would show up. Those are the conditions.
So never having viewed results, elevated results, or purchased paper results. Okay, and all results approved, so... Okay.

**Jennifer | 08:07**
So that's something that we should look into and look at the scheduled events and see if there's where are the schedule, where is the scheduled event stored.

**harry.dennen@llsa.com | 08:17**
I don't know, I have to find out.

**Jennifer | 08:23**
Okay, anyways, I'll look into that. I'll continue like, researching that with me hel today, but that's kind of where I'm.

**harry.dennen@llsa.com | 08:35**
Yeah, I'm just...

**Jennifer | 08:35**
Do you want to give any updates?

**Wesley Donaldson | 08:40**
Sorry, what was that, me or Harry?

**Jennifer | 08:43**
Either one. I was just naming someone.

**harry.dennen@llsa.com | 08:47**
Just on the scheduled events thing though, a bunch of those will be legitimate, and I don't know that we can tell which one is which easily.

**Jennifer | 09:00**
I guess I was more concerned with multiple emails going to the same person.

**harry.dennen@llsa.com | 09:06**
Okay. Should definitely be able to. D DOP.

**Wesley Donaldson | 09:18**
Okay, for Mandalore, sorry.

**Jennifer | 09:20**
Okay. Does someone want to give their update?

**Wesley Donaldson | 09:24**
So for Mandalore, not too much urgency on the board from Friday.
So our priority for this week is closing out all of the outstanding items that we had that we put in refactor that we were... Were known issues going into the MVP on last Friday. So the team has pulled in much of those. Those are mostly just around mismatches between the Figma implementation, the FMA design and what we ultimately implemented.
So team is multiple tasks for that. The next priority was around starting the recurring order ingestion process. We had a sync session this morning. Coming out of that session, it's felt clear that there were additional uncertainties. Antonio had shared some additional steps in the process, specifically around hydrating information from recurring outside of just getting the webhook.
So that requires a little bit more conversation in architecture, so we're planning to bring that to architecture this Tuesday. However, there are enough tickets, enough surface area inside of that recurring Epic to start working, for example, in the API gateway to start working today and tomorrow prior to architecture. We have another stream of work around just closing out some smaller items.
For example, there are a few requests for comments that are still open. There are a few events that we wanted to create or investigations we wanted to do on specific types of events in the system.
So just using it as a little bit of downtime until we have more epics from product and that's not a head against product my research imagination, but just using that as an opportunity to close out a few observability-specific items and things that we had in the queue for a little while. As far as the order-specific...
I've asked the team or with the team. I'm going to come back in the refinement meeting. I'm expecting just to go over what we have planned and what we plan to take on for order processing inside of the refinement.
So I'm probably going to reschedule that for 30 minutes instead of the hour that currently exists because most of those are not product-related. That's it for Mandalore.

**Jennifer | 11:44**
Okay, thank you, Harry.

**harry.dennen@llsa.com | 11:49**
Yeah. So priority is just the system stability stuff around those default arrow throws for projectors and command handlers. So things work on that now and then the conditions for user account creation, that's the main priority for the week. There are a couple of updates to Adam and portal, and the blood pressure fix is about to go out. Beyond that, we need to...
I'll have a chat with Ray about the... It was status management. So I remember last week he was... He still needs to look at that. So I'll find out where that is, and then we can pull it into stories today. Hopefully, that's everything.

**Jennifer | 12:44**
What, for the projection errors, what I cannot remember what that was around.

**harry.dennen@llsa.com | 12:52**
So if in some part of the system you decide to add an event, if you don't update every projector that is projecting building projection from that stream, you could break it. So that's why we were seeing issues in different parts of the system, unrelated parts of the system.
So basically, any time there is a stream being used to generate a projection, if it encounters an event it doesn't know about, it should not throw an error, it should just carry on. The same thing applies to command handlers because we need to be able to update streams with new events and not break things that aren't unrelated.
So currently, for example, the connectors for every lander that we have, we will have a connector that is reading the streams and making a choice of what events to then distribute to the particular Lambda.
Right now, you could be updating something for one connector that's relevant to one connector and not relevant to the other twelve, and the other twelve might break if they are default throwing an error, right?
So we don't want to have to go and add that event handling for everywhere when it's only relevant to one place.

**Jennifer | 14:04**
I see. Okay, thank you.

**harry.dennen@llsa.com | 14:07**
Yeah, we actually prioritized that over the Cognito-only generate on order because if we need to, I can just delete again. But we are only building on monthly active users, so I don't know if this is going to help us on a cost perspective, but at least we won't have them in Cognito.

**Jennifer | 14:32**
That makes sense. Yeah, I think it's more about making sure we don't block anyone's real account from working, so... Okay, then other updates from last week for Beth. I know that we were talking about how I think you had mentioned to us while you were out and still paying attention to the discounts weren't ready yet. We were wanting to see if you thought that could be ready by Wednesday for us to have a sink on it for Mandalor to talk around doing that one.

**bethany.duffy@llsa.com | 15:10**
Yeah, absolutely. My plan was to bring it into refinement tomorrow. My goal for today is to review where we're at with the demo and what is still needed for production readiness and then tackling things from there.
I know for sure discounts are one of those things, so I'll focus on that one first. Then whatever else I identify as a gap, we'll need to bring that in as well.

**Wesley Donaldson | 15:36**
One.
Sounds good.

**Jennifer | 15:44**
Okay, awesome. So we can set something up for Wednesday just to prepare ahead of time and then plan for that. Great.

**Wesley Donaldson | 15:53**
If you see something... Bet that's more... Less of a feature. More of a... Hey, that's a bug that we or definitely didn't implement correctly or we missed. Feel free to just open that as a defect underneath 666, please.
Just let me know you opened something and I'll go find it.

**bethany.duffy@llsa.com | 16:10**
Okay, yeah, I can do that. I did see, while I was just getting caught up, Jiffco asked Greg a question, and there was just one discrepancy in Greg's confirmation. There is one diagnostic that will always be available regardless of the state, so I'll get that.
I wouldn't call it a defect because it was just... Greg didn't know that we could offer that. So maybe I'll just create a task for it.

**Wesley Donaldson | 16:39**
Yep, sounds good. Yeah, it's either way, he has bandwidth for it and we're expecting it's going to be a priority as soon as you hand it over to us. Maybe you can help me just understand. How is the board active? Who's actively using the TE Commerce Store right now? Is their eyes on it? Is it something where we can feel comfortable just making if it accidentally breaks for an hour or so?

**bethany.duffy@llsa.com | 17:06**
My assumption is no one outside of this team. But let me just verify with Greg and Star that they didn't hand that URL off to anybody before we go ahead and make changes.

**Wesley Donaldson | 17:19**
Sounds good.
Actually, let me let it.

**Jennifer | 17:28**
Awesome. Is that everything from my friend? Anything else?

**bethany.duffy@llsa.com | 17:34**
I do have a question around timing, which is everyone's favorite topic. I know that we were we've started looking at the like post order processing stuff. Are we still in kind of the Disk the design phase where we're gathering contracts and things like that, or. His work actually started to connect the Recurrly data stream into Thrive and then into CTAR.

**Wesley Donaldson | 18:08**
So that's what I was mentioning earlier. So we have the first two epics fully built out. We had a conversation this morning where Antonio raised one item that we didn't have accounted for, specifically around how we do hydration.
It's actually very similar to how Shopify is... Where the web just gives you some information, not all of the information. So we were missing the document and the ticket around going and pulling that additional context from Recurly.
So we're going to get the ticket in for that. There is one from last week's effort was around designing the design pattern for Emmett and how it supports Recurring going forward that Sam provided feedback by the end of last week.
But Tony had to make one update that he's bringing into architecture tomorrow. But we have enough surface area inside of that Epic where we can start working on an API gate. We are the Lambda function as an example.
So we're... It's both... Yes, it's still in design. But we have enough where we can start working.

**bethany.duffy@llsa.com | 19:08**
Okay. The design things are... I want to make sure that you're not waiting on product for anything just because that was heavily technical and heavily architecture-driven.

**Wesley Donaldson | 19:21**
Exactly. There's nothing you're not blocking anything on that.

**bethany.duffy@llsa.com | 19:25**
Okay, beautiful. I'm still getting caught up, so just trying to understand where I am, the bottleneck so I can tackle those things first. Okay. If you had to guess, when will we see an order inserted into CSTAR?

**Wesley Donaldson | 19:43**
So the Epic number one is where we should be able to start pulling the information. I don't think CSTAR Epic is Epic 3. We're doing some investigation. Part of this one.
But Epic 3? There's one before it, so I'm guessing the best-case scenario is towards the end of the month, two weeks or three weeks out because the team right now we're feeling comfortable that we can get through Epic one by the end of next week.
I'll probably start Epic one next week as well. If that just gives you a chaining... So that looks like about three weeks size when we'd start working on Epic three around CSTAR.

**bethany.duffy@llsa.com | 20:24**
Okay. Okay, got it.

**Wesley Donaldson | 20:31**
If there are commitments that you guys have made that I'm not aware of and we need to get ahead of something, please let me know. That's just where the team currently is.
But we can move stuff around, we can deprioritize some of the refactory items. They're not mission-critical. So if there is a timeline there that you know what it is, please let me know and we can try to pivot around it.

**bethany.duffy@llsa.com | 20:53**
I was just aiming for the end of Q1. We could say that we were in production. I don't know. I still have to catch up with everyone from the board meeting and see if dates were given or things were promised. I would say, though, let's continue focusing on the critical path first, which would be getting an order successfully into CSTAR, and then I would say let's circle back around and refactor or fix things up unless it's going to significantly increase the amount of work that we have to do on those subsequent things. Obviously, it's always a balance, but I would definitely prioritize getting a working production-ready and end flow over tightening things up technically.

**Wesley Donaldson | 21:50**
Yeah, and I would agree. I think the only challenge I have there is... Antonio feels very strongly that... You and us, I would say as well, feel very strongly.
It's only maybe two engineers who have challenged the team to see if we can find surface areas to support three engineers. I have a rationale for that. But right now, if we take the direction that it's only two engineers, we still would have bandwidth on the team to take on additional work.
So that's my thinking. Only 30-40% of the team is really focused on the order at one point because a lot of it is very dependent. You have to complete Epic one before you can really do anything. Use one Epic two.

**bethany.duffy@llsa.com | 22:28**
Got it. Okay.

**Jennifer | 22:29**
I think one thing I'm hearing is that you're completely completing Epic one, then Epic two, then Epic three. We can't get any answer until, I think, 3. Is there any way that we can do a happy path where we're not completely flawless with the grabbing of the information? We try to grab something, and even if we get an error from entering into CSTAR, something like that, just to show a little bit more... I don't know, I'm following here.

**bethany.duffy@llsa.com | 23:05**
Even if we're using MOC data for the meantime, right? We know that we have the participant information from the account. Let's go ahead and match someone and insert them into CSTAR, and then mark the rest of the data.
If we could take that kind of approach so we're making iterative progress and not waiting until the end to get a fully formed order object into CSTAR, that would make me feel more confident.

**Wesley Donaldson | 23:33**
Understood and quite...

**Jennifer | 23:35**
One of the things that Lance and Jeremy might be able to do is set up ECOM 3 because they... Jeremy was part of setting up ECOM too. And just getting a third basically Azure setup. At least to take in data and get mock data through to ChatGPT might be a way to increase the surface area without affecting what Antonio and Joo Elvis are doing.

**Wesley Donaldson | 24:08**
I hear that. Sorry, just to clarify, it's not literally that you cannot start Epic 1 until 100% of Epic 2. Epic... I'm sorry, you can't start Epic 2 unless 100% of one is complete.
It's more like staggered. So we need a solid week to get to a good spot on one and then there's opportunity to start staggering the work forward. Sorry if I wasn't clear on that before, but great call out on spinning up EC 3.
I think you have made that comment before. So we're meeting together just to close out recurring concerns in about an hour. I'll raise that specifically during that conversation.

**bethany.duffy@llsa.com | 24:42**
Okay, awesome. Yeah. Anything that we can do to parallel track things will be helpful. I'm expecting there to be some bumps along the way, but as long as we're documenting them and knowing that we need to address them, I'd rather that than just waiting.

**Jennifer | 25:13**
Okay. Thanks, everyone.

**harry.dennen@llsa.com | 25:16**
Are we doing product office hours?

**bethany.duffy@llsa.com | 25:20**
Yes, I have one thing that I need to go over with Lance. Is there anything from the end or team that you guys need? No. Okay, then you guys are probably going to skip Wesly and Jennifer. The only thing...
Harry too, I guess. If things have popped up on Rinor, I have about a thousand unread emails in my inbox, so if there's anything that you need me on, just send me a team's message.

**Jennifer | 25:48**
The email all delete.

**bethany.duffy@llsa.com | 25:51**
I honestly might. And just, you know, people will find me if they need me as word.

**Wesley Donaldson | 25:56**
That's literally the strategy in my past job that I did. I just like... I'm not even marking it as red and then I go speak to all the PMS I did not try to read through all of those emails.

**bethany.duffy@llsa.com | 26:07**
Yeah, a lot of things.

**Jennifer | 26:08**
I told someone to message you today because I said, if we message her... I think it was Thursday or Friday. If we message her now, it's just going to get deleted. Make sure we wait until Monday morning.

**bethany.duffy@llsa.com | 26:22**
Yes.

**Jennifer | 26:22**
Yeah, I don't remember what it was, otherwise I'd tell you right now.

**bethany.duffy@llsa.com | 26:25**
That is... Yes. The only thing I'm scared of missing are Jira mentions. So if there were any questions and comments or things like that because those aren't super obvious inside my inbox. I get updates from... About everything.
So those are easy to miss but if you need me, just let me know.

