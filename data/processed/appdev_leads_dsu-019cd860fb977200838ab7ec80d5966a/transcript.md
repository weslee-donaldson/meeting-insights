# AppDev Leads DSU - Mar, 10

# Transcript
**Jennifer | 00:03**
I'll go over his update. Let me open that now. Okay, for the indoor team, the main themes on this are the Cognito, updates that are being done. A lot of those are still in progress, and getting worked on. Then I know that Dane did finish like some of the error stuff from the projections and event handlers throwing or like a default throw. This should help make our system more resilient. 
So that is now in review. We did have everyone. There's a lot of stuff in review. So a lot of people got assigned to do different reviews or to push the other team to see if they could help out with some of the more architecture ones overall. Then the other stuff that's in progress is the next portion of the admin portal. 
And I believe we're going to be doing they're going to be doing refinement on the status management sometime today or tomorrow. I'm not sure when Harry has that plan. Wess. Did you want give your update?

**Wesley Donaldson | 01:41**
Sure, one second. CHRING okay, so one of the priorities for the week was closing out all of the existing refactor or defect issues that we had from the MD P so the team is still working through that. Tickets are coming in, reviews are going through, so we're making progress on those. No blockers are concerned there. The other priority was around the recurly commerce. 
So we from the refinement yesterday we did pull in tickets and assigned those tickets out to team members and then reinforce with the team the urgency of for those who are tasked with Rick Curly specifically Antonio Giffco and Lance and you Elvis for them to prioritize closing out their. 
But related tickets by end of day today, if anything cannot be closed that I'll be moving those off their plates to allow them to focus on recuurly. Speaking of recuurly, there are a couple concerns that I have with Recurrly right now. Specifically, our implementation plan seems to be being challenged or seems to be getting additional refinement as we're going, which is perfectly fine. 
So my task to Antonio and to Elvis was to come to the architecture meeting this afternoon with just a clear two core things that we need to have addressed and how those will impact the recurrently implementation going forward. 
The good news there is we do not feel that those fixed those unclear decisions will impact the current recurrent recurrly epic 1. So the ability to set up a CDK for spinning up the API gateway, spinning up the LLaMA, spinning up the validation, all those things we can tackle so the team is not blocked on this epic. 
But those decisions will absolutely inform the next epic that we're looking to refine and start next week. So pressuring the team to kind of focus on getting that architected and all the unknowns answered, another concern. 
And we don't have to I guess this would be the best place to speak about it. But stays. Greg, the direction that we're targeting getting this live by end of March. I think that in my conversations with the team, I think we're still trying to figure out what that means, especially beyond just the beyond epic one for Recurrly. What does that mean for the C Star integration? What does that mean for Cognito integration? 
So that's something we'll be hoping to have a conversation of in architecture today. I think the theme that I'm seeing here is there's still some uncertainty around the timeline and the implementation plan beyond just ingesting the orders. Other things that we're doing as a team, there's a bit of there's still a bit of work left outstanding on just resolving the errors that we had from last week. There's 40000 ish events. 
And Jennifer, thank you for pairing me. How on this. So he feels confident he has clarity in what needs to be implemented, what needs to be rerun. I've asked him to prioritize getting this ticket, so this is just a job he can kick off. Once that job is running, there's not a lot of manual review or verification needs to be done. 
So he's prioritizing getting this document docket and documented out and sent for review by the team for today as well. And this ticket is part of the larger effort around just being a little bit more diligent about, our observability and how we're managing events and errors. 
So this is a bit of a gate for that. This creates like a playbook that uses some of the knowledge that me how has generated and just dealing with these production issues and a lot. And then we'll use that to inform the team. Taking more of a shared ownership, being able to have Lance own it for one day or two days, be able to have myself own it for one day or two days. 
So that's the goal of this, and that's part of the larger effort of just more diligence around keeping the system healthy. So created in a column just to represent that urgency. And then we have some things that we came out of Architecture with last week around how we wanted to do some additional instrumentation in our ecosystem, specifically this idea of having an emitting Lambda that has an emitting Lamba that has all of the base objects that we want to keep track of and then having a dashboard for that epic. The team kind of pushed back a little on. 
And that pushback requires a little bit of investigation. So calling those out as tickets for me how once he's closed out these core like P ones, the other stuff we're just pulling as we go. There's a few items in here that are cleanup items. There are lower priorities, so those I don't expect will block the team, but if they have bandwidth, there are a few things. 
For example, some older tasks around how we wanted to do error handling that we just need to close out because they're still not they're still on the board or still in the backlog. Questions?

**Stace | 06:38**
I want to go back to the very beginning of your update when you said there were recur concerns around the timeline or quite a lengthy stuff to be done in architecture session. Big Architecture is the right place to dive into a deep in here, but can you post a summary or an agenda in the meeting? Those meetings tend to get off ramble through, and I want to be able to cover everything that you feel is a concern.

**Wesley Donaldson | 06:58**
2. 
Absolutely.

**Stace | 07:09**
The other, the kind of the second part of that we called out Greg and I members. SPE's important here, right? 
And we talked to the entire team about this month and a half ago, right? This was always the deadlines there should be zero surprises like that. 
They were tracking towards the end of March, which is important, right? 
Because we have the conversation that, you know, what we build and maybe importantly, what we don't build is important. And so maybe that maybe architecture discussion is part of that, but it shouldn't be a surprise. 
And are they just worrying about kind of some things that maybe aren't a concern, like when you bring up recurring and then I hear the word Cognito, right? They might have something to do with each other in the future, but like that hasn't even come up at all. 
So I wonder why, like they're spending cycles on that for something like this when we have some basic stuff, right, that really needs to be done.

**Wesley Donaldson | 08:15**
I ice cream. 
Yeah. My read on that was it was more in passing like well, what is the downstream beyond pushing the events into current look like? And then one of them that was brought up was Cognito.

**Stace | 08:34**
Right? Well, I mean, it's pick your architecture, right? This is going to work just like it. We're going to save data from recurly and other systems are going to read it out. [Laughter] It's really what needs to happen here.

**Wesley Donaldson | 08:52**
Okay, so I'll send that agenda to this channel

**Stace | 08:53**
Seven.

**Wesley Donaldson | 08:56**
Or I'll send it. I'll send it to the architecture channel as a pre read before I normally send that to Sam before the meeting anyway, so ill I'll just share that with the whole team.

**Stace | 08:57**
Okay, yeah, that would be helpful, I think, to make sure we stay on base. Yeah, some of the things we're concerned about, like I said, will be issues we'll tackle in the future as we do. Purchasing in the portal and a return user experience. 
But luckily, I think some of the concerns I're mentioning are not here. I don't know if we'll get to it today, but I had kind of I guess my general concern is now we're at March, right? We're really kind of addressing the error flows and observability in December, January and there still seems to be divergent approaches appear rather than any sort of solution we've come to. 
So I think that's something we have to close down to pretty quickly. That epic of having another Amid or LLaMA just doesn't smell right to me. But there really should only be one venting system, and we should build to monitor that without recreating the events and sending them to other systems and storing everything twice so we can have observability, right?

**Wesley Donaldson | 10:19**
Yeah, and full transparency states that's kind of as you all this is and me how is like if I were to summarize was very much aligned to that.

**Stace | 10:20**
It just sounds to me like there's more to break. 
Okay, so. Okay, sounds good. Well, thorough update, so that's.

**Jennifer | 10:40**
Thank you.

**Wesley Donaldson | 10:41**
No worries. I'll get that agreement.

**Jennifer | 10:42**
I just want to I agree with everything you says.

**Wesley Donaldson | 10:42**
Over.

**Jennifer | 10:46**
And I just want to say, like for the deadline, for this first deadline, the goal is to make it work the way that we have Shopify working everything into CSTAR and then from CSTAR and to thrive. Eventually we will get it.

**Stace | 11:01**
Everything to arive in the C star.

**Jennifer | 11:03**
I'm sorry, I think I thrive differently. I'm thinking of thrive as current everything.

**Stace | 11:10**
Doing we're grabbing. Yeah, creating that ACL layer and current and then feeding C star. But the C Star component. Just like Shop.

**Jennifer | 11:18**
The only difference.

**Stace | 11:19**
Is it's not coming from Shopopify, it's coming from the ACL layer and drive.

**Jennifer | 11:26**
That is right, yes. Okay, so we are. But as far as like getting our participant stream and everything that's coming from C Star. So we don't have to worry about anything with Cognito or anything like that because it's already working.

**Stace | 11:41**
Correct? Yeah, they're if they're thinking that through again, that is probably most definitely a may problem. [Laughter] But no refactoring of the results of participant streams creating cognitive users at least in relation to recurrly in March or April. I don't think.

**Jennifer | 12:08**
I had to go.

**bethany.duffy@llsa.com | 12:10**
I was going to say all of that. So thank you guys. The only additional thing I want to add is right now Shopify is not mapping collection method. And if that is what we have to keep going into the end of the month, that's fine. We can do a fast follow up for mapping collection method to the different states. 
So that's the only like additional scope that we may need to.

**Stace | 12:34**
Yeah, I think that's part of the new product launch. And. And Leslie, I think we probably do need a team meeting. We, you know, coming out of the board meeting, we did a road map. But for everything that needs to be done, we can collectively share that back. It probably should be in it all hands. 
So we will do some more socializing of what is to come. But Beth, I think that aligns with the blood tests, which would be phlobotomy, which would be a new collection type. So I'll have to think that whole thing through.

**bethany.duffy@llsa.com | 13:08**
I was thinking more of what we have today. So we have the POC method for most of the states, but then we have like Oregon and Connecticut that have to be mapped to the a DX version inside of CTAR so it really is just an adjustment to the order proxy part. 
But I'm okay with punting that to, like, the week after or so of the initial launch because it's already broken in Shopify.

**Jennifer | 13:30**
Okay. 
A couple more things, a couple more topics that I had. I'm going to share something in the chat. I got this from Brian. I'm not sure if this is their final version or not. I'll check that, but we do now have AI access to infrastructure policy. 
From the security team and they are working on getting users created. I talked with me how about the different permissions and resources we wanted access to. Mostly it's just going to be cloudwatch read only for, like the logs for like LLaMA C2. 
But I had a list of that and it's in the ticket. And then access read only access to cloud formation and, cloud front. So just nothing with Pi, except if we accidentally have Pi in our logs which we have some tickets that are getting created for getting those out. Which leads me ont to my next subject, which is from Century. I'm seeing a bunch of like reoccurring errors, so I'm gonna be creating some tickets over the next week to make sure that we address this right? Any questions? 
And then final topic Yalvis had brought up that he is a little bit worried about our code review and deployment strategy and process. Before I go into that, Wes, what question do you have?

**Wesley Donaldson | 15:21**
Curious what? I'd love to do a little bit of a deep dive on those tickets that you've seen coming out of Century, like getting some kind of grouping of them. Understanding like root cause like I'm sure the implementation ticket could do one off, but I guess my question to you is there an opportunity or need for us to do more of an investigation on the tickets that we're seeing and then distilling them out into action actionable items?

**Jennifer | 15:43**
Each of them are gonna have a triage component because not all of them are bugs per se, but could be incorrect logging.

**Wesley Donaldson | 15:54**
Gotch it.

**Jennifer | 15:57**
Yeah. And then? Where? Especially on.

**Stace | 15:59**
Things like Century, I'd like to in general, I want to keep pivoting away from just investigation tasks, right? That there should be and there might be execution involved or there might be investigation involved in the execution, but the execution should be against. Century is really a log and system arrow monitoring thing, right? 
So there's an exception that catches it's fixed that exception and wes that there may be investigation to do so, but the outcome should be fixed that exception.

**Wesley Donaldson | 16:30**
Great.

**Stace | 16:34**
If you find other things right, then those could spawn other tickets to fix those too.

**Jennifer | 16:39**
Yeah. And fi. That exception could be the log is logging wrong, it could be the threshold is incorrect, like if I do something with alerting from CLOUDWATCH, or it could be that there actually is a bug in the code and so it's gonna be one of those.

**Stace | 16:55**
If central telmetry catches it's probably a code problem, right? Because that I think it alerts on in fact.

**Jennifer | 17:05**
You should an incorrect log or it could be an incorrect log like something that's logging like an expected issue rather than an unexpected issue, like if someone. There's a lot of viewer not founds, which can happen if you type your email in wrong incognito.

**Stace | 17:27**
But then that means.

**Jennifer | 17:27**
That shouldn't be showing.

**Stace | 17:29**
Anything, right? Because then we should catch that, and it shouldn't be creating a code exception because Century only picks up code exceptions.

**Jennifer | 17:37**
Correct? Yeah, that's why. Yeah. So I kind of see it as more of an incorrect log rather than a bug. Well, I mean, it is a bug in the logs, but rather than a user facing bug, I should.

**Stace | 17:50**
I get it.

**Jennifer | 17:51**
Okay, but yeah. So. And then there's probably like if I see any from Cloudwatch, I'll create those as well. Yeah, I have been working with me howl and we are working through those errors though first or the park events first before I get all of these created.

**harry.dennen@llsa.com | 18:15**
A message in this morning. I think we can probably ignore the PDF generated ones because there's going to be duplicates there. The only one I'm worried about is the potential duplicates on all results. Ready.

**Jennifer | 18:25**
There? Think he already ran the PDF ones, but I think there's a bunch that are still parked with errors, so we can look at those errors and possibly create tickets if they aren't already created. There are a bunch of parked events due to a first name not being like not having your first name. 
I think that one of those ones in Century that I saw where Cognito is not creating an account if you don't have a first name. And somehow there are people in CSTAR that don't have a first name, so we need to be able to handle that better. 
And. I saw another error that, like some Cognito account didn't get created because the email address was malformed. So there's a.

**harry.dennen@llsa.com | 19:20**
Sanitization issue we have from CSTAR. It sounds like.

**Jennifer | 19:24**
There is a. Yeah, that's one of the issues that's going on with the parked events.

**Stace | 19:29**
Yeah, okay.

**harry.dennen@llsa.com | 19:30**
That's expected. So then, do we want to have a discussion whether we want to, like, have something automated? Because the parted events is kind of exactly the thing. It's like, hey, I can't deal with this. Let me park it for a human to come and look at. 
And we could maybe automate more of that process. Or we could look at moving the problem to the front and bouncing back and saying, hey, you gave us something wrong.

**Jennifer | 19:54**
Well, so what I'll do is I'll. I'll create a ticket for, like, handling those, things. And we someone needs to look into where it's happening because I'm not sure where in the system those things are happening because I'm seeing it in multiple places.

**harry.dennen@llsa.com | 20:11**
Yeah. So the first thing is required for ital stuff to work, so that's definitely gonna th.

**Jennifer | 20:17**
But it's not it's required for it to work, but it's not required to actually send an e mail. It's just required to match with the C star user. But if the C Star user doesn't have a first name, then technically it's not going to have it anyways. 
So again, it's in multiple places. It's incognito. For some reason, Cognito won't create a user for first name and that's not even required, so we don't. Yeah, so anyways, this is just one of the things. 
But yeah, it's one of the issues that I was going to create. But yeah, that's part of the parked events. And then I don't have. Or I was going to talk with me howl after he ran everything else that's like safe and won't cause any notifications. I was gonna work with him on, going through the all results ready ones and running those, but, making sure like. 
Like basically turning off notifications. And then we can only notify anybody who hasn't viewed results or has gotten the results like in the past month or something like that. So we're not sending anything from too far in the past. Which I think all of these are in the past months. 
So I don't think it's a big issue, but I just want to make sure. 
And I don't want anyone that's viewed the results to get another notification. So yeah, we'll compare those lists together. Anything else?

**bethany.duffy@llsa.com | 22:10**
Do we need the product office hours today?

**Stace | 22:14**
We don't have anything.

**Jennifer | 22:15**
Ray does have something with.

**harry.dennen@llsa.com | 22:19**
Nick Nicki has something for us yes, he's demo to yeah.

**Jennifer | 22:24**
Yeah, Nick is demoing to Ray sorry.

**harry.dennen@llsa.com | 22:27**
Or us, all of us.

**Stace | 22:29**
Yes.

**Wesley Donaldson | 22:31**
Nothing on Mandor's side.

**Stace | 22:37**
Okay, see you there s.

