# LLSA, Blue/Green Deployment Planning - Mar, 04

# Transcript
**Wesley Donaldson | 00:28**
Hey, don't you?

**Antônio Falcão Jr | 00:31**
Hey, what's the hell you're doing?

**Wesley Donaldson | 00:33**
Pretty good. I just paid $1,500 to put my kids in summer camp, and I'm super happy about that.

**Antônio Falcão Jr | 00:43**
[Laughter] Okay, thank you for sharing that.

**Wesley Donaldson | 00:44**
It's only like 3000.

**Antônio Falcão Jr | 00:53**
So my daughter's coming, you'll know that, right?

**Wesley Donaldson | 00:56**
Exciting, right?

**Antônio Falcão Jr | 00:59**
Yeah, absolutely.

**Wesley Donaldson | 01:02**
The first one is this your first?

**Antônio Falcão Jr | 01:04**
It is. It is our first. Yeah.

**Wesley Donaldson | 01:07**
The first one is always the hardest, and the second one you... Basically, it's like engineering. You just do better each time.
It's an iteration. There are so many things that my wife is like, "I wish I'd done that differently." I'm like, "Yeah, I was right, but that's not important. But I agree we got better each time.

**Antônio Falcão Jr | 01:25**
Perfect.

**Wesley Donaldson | 01:25**
We just need to have ten kids to be perfect.

**Antônio Falcão Jr | 01:29**
[Laughter].

**Michal Kawka | 01:30**
See?

**Wesley Donaldson | 01:32**
Let me see if you... Of us can join this. I definitely want to be part of this conversation. Amy, Hal, give me one second.

**Antônio Falcão Jr | 01:40**
Are you guys?

**Wesley Donaldson | 01:48**
Yeah, I know that. That's what I need. Chat, Elvis.
Okay, that's not what I wanted in...
Can you guys hear me? My printer's going crazy.

**Michal Kawka | 02:35**
We can hear you.

**Wesley Donaldson | 02:36**
Okay, sorry about that.

**Michal Kawka | 02:42**
S.
Hi. I...

**Yoelvis | 03:12**
Sorry. I was in another meeting.

**Wesley Donaldson | 03:14**
Hey, guys. All right, so hopefully, this doesn't need to be an hour. This is Antonio. You're all of us. This is a follow-up from the architecture conversation. Coming out of that conversation, Sam had shared some notes in his function as the main architect, and some of his notes were very direct and things that we wanted to tackle. I don't necessarily think there's a lot of detail there for us to immediately start assigning tickets.
So I wanted to do two things here. One, I wanted to know if you were not part of that conversation. So I want to just share with you the information from that. But I wanted to get your perspective as well as someone who's been tackling much of the blue-green challenges and implementation concerns we've had around the architecture in the past four weeks now. Three weeks now. Again, thank you for hearing that.
So the hope from the meeting is that we would get to a resolution, at very minimum, around some of the challenges we saw with blue-green, but more importantly, being able to have better visual, better transparency, better observability, that's the word. I'm looking for into what's actually going on in the system, right?
So very specific direction relative to things like, "Hey, let's create some form of a dashboard." How are we going to instrument the downstreams? How are we going to instrument things like Century where...? What is the role of Century relative to the dashboard? What is the role of BI? How do they get their reports? What are their needs? How are we going to support any particular business needs they may have?
So my hope for this session basically is just to take an initial pass. I have some content I could build out epics already. I have some rough ideas of how to build out these epics, but I wanted to get this group together and just take a moment to review what we came to coming out of that meeting and then align on just at a high level, what are epics that we need and the goals for those epics? Does that make sense?

**Yoelvis | 05:11**
Those things.

**Wesley Donaldson | 05:14**
All right, nice. So I guess let's start. Let's jump straight in. Right? So I guess the first question is, did anyone read these? Did anyone have a chance to like, did anyone have a chance to consume what all these meant?

**Yoelvis | 05:26**
I did.

**Wesley Donaldson | 05:28**
Nice.
You, Elvis, you and Antonio were part of the call, so I'm going to assume that you guys generally are aligned to what's inside of this content, right?

**Yoelvis | 05:31**
Yeah. Yeah, sure. I haven't read this in detail, but yet I am unaware of the issues.

**Wesley Donaldson | 05:47**
Okay, cool. So to get a resolution on this and my thinking, the business direction generally is they don't want us to do things that are not aligned to commerce as a priority. I view this as a line to commerce priority.
So I can tweak the naming to be like enabling commerce, but at the end of the day, this is effectively just improving our process around our deployments and our monitoring. So keeping that in mind, it took an initial stab. The first thing I thought was... Sam called this out as well as... Hey, let's just clarify where we currently are.
So the first epic in my mind is like, "What is the current state?" So we already had this idea of we need to do a bit of a code sweep. So look at all of the various landers, look at the various jobs, GitHub actions that are out there, and just understand. Are there any other unknowns? Which is a hard thing to say, right?
But effectively, it's a bit of a research effort around the issues that we are aware of with all of the blue, the environment switching with the deployments, and looking at some of the code base to make sure that we don't have any challenges there.
So that's a little bit wide open, but effectively, it's a bit of a research moment. We already fixed Amak if I'm right, I think we've already fixed this, like at the job level. So this should already be resolved, but still calling out like intentionality around making sure that we don't. Whatever we've identified in that code sweep, we're addressing it, and if there's something else outstanding, we're addressing it.
And then this idea of a validator. So Sam had shared and I'm not sure if many of you guys have seen some of the on auto stuff he's working on, but I didn't put it in here. Lovely. There are validators that effectively run on pre commit hooks or pre publish or pre published hooks. That kind of review. The code has been subjected. You can imagine like someone makes a CDK change a pre commit hook validator. Pretty published hook validator would review that and would kind of call out a report and say, hey, these are concerns you have.
So build those validators. Integrating them into our delivery pipe and our build pipeline would be its task unto itself. So that's kind of where I'm that's what I'm thinking right now for the three major tasks within this epic thoughts. Additional things we want to add clarity disagree. My hope for this kind of session is I don't want to just throw tickets on the board. It really needs to be informed by this folks that know the work best.
And Antonio is the architect. You of us is the principal engineer. Me how is just the god of builds right now like this is that I want to do small groups not every single person hoping that to get like direct feedback here like create this ticket here's what I want in it.
That's the hope for this meeting. It's not really about me talking at you.

**Yoelvis | 08:39**
Now go.

**Michal Kawka | 08:42**
Yeah, I think that pick one makes sense. You are correct when we already fixed the leg resolution, so that was just a very unfortunate human error. That was introduced to the pipeline, and we haven't really noticed that for quite a while.
So, the badlock in that was that AWS doesn't return the target group. Target groups in the order they are defined in AWS. So if you define target groups blue-green, you cannot expect that if you query the target groups using the AWS CLI, they will be returned in the same order.
So now we made that future-proof. It just checks the logical IDs, whether it's blue or green. We don't make the AA comparison based on the indexes. So it's fixed now. It shouldn't happen in the future, but that's something that we should investigate.
I mean, it shouldn't be present in the current code base anymore, but I think it would be worth double-checking if we might run into similar issues. I doubted it. We double-checked through Figma, we tested, and we switched legs
in both directions. Like I mentioned in the startup, Harry already did a project switch. It all worked flawlessly, but I think the epic one makes sense. I'm just trying to understand what that resolution compliance validator would be. You mentioned pre-commit hooks, and I'm not sure what they are supposed to do.

**Wesley Donaldson | 10:19**
Yeah, so basically what it is, it's just like an LLM instruction. It can... In how on be beyond auto works, it is effectively just describing the challenge, describing what you should or should not do, and then letting the LLM run a validation against it to say, "Hey, and then report without blocking the user, but report out and say, "Are you aware?" These are things that you have introduced. As an example, let's say that we created some additional lambdas, and for whatever reason, they were not part of the scheme of blue-green. That would be something that the validator would call out.
That's the intention.

**Michal Kawka | 11:01**
Makes sense.

**Wesley Donaldson | 11:03**
Okay, so...

**Yoelvis | 11:04**
I'm still not sure about those Palios to be in the local e development environment. I would say that we should have something like that in CI. Say some thought that we don't want to block the user for Miro because of the... Because those are suggestions.

**Wesley Donaldson | 11:15**
In CI.

**Yoelvis | 11:27**
But either way, I think even if they are not blocking comments or feedback, th those could be just comments in the PR that are non blocking like Coilo, DOS and other tools. But in continuous integration we can just have everyone using that. It would be kind of enforced by the fault. We'll need to configure anything locally because sometimes, you know, some users may not have the same ll n or the. Those two are changing constantly.

**Wesley Donaldson | 12:01**
Yeah, ask me how about the release notes LM work that we recently did.

**Antônio Falcão Jr | 12:02**
So I...

**Wesley Donaldson | 12:05**
So I actually agree, I think it's a great idea. I would say let's punt the conversation. Let's not have it here. Let's just simply say that we need to come to a resolution.
Maybe it's not a spike. Maybe it's just like, "Hey, here's a PR from you." And then we'll just close the loop on an incentive architecture review. That's probably the easiest thing to do.

**Yoelvis | 12:26**
But either way, I, that's not like a solution. It's just like getting some help from the AA is. But the issue we are having is.

**Michal Kawka | 12:36**
Is like...

**Yoelvis | 12:38**
It's different. It's not an AA validator thing?

**Wesley Donaldson | 12:43**
Well, so it's like accessibility checking, right? It doesn't actually fix the problem, it just tells you what the problem is and it's still on the engineer to resolve the underlying problem.
So instead of getting in a pre-commit hook or pre-published hook, we're getting at CI time, at build time, and then that just comes back in the PR review. So it still needs to be resolved. That's the resolve is on the engineer. I wouldn't worry about that for this conversation.
We can arguably create standards or create some kind of explanatory of what we should be doing to make it easier on engineers. But I wouldn't worry about that for this...

**Michal Kawka | 13:18**
No.

**Wesley Donaldson | 13:20**
All right, anything else do we agree, disagree, anything else we'd like to add to this? What else? Again, the goal here is how do we get to clarity on where we are and then quote unquote standardize or fix our current stabilized... Probably a better word for where we currently are. As an example, we have some known issues that we have whenever new landas were created, they were not being added to the right environment.
So we've fixed that already. But what we're looking for is are there things like that we know are outstanding that we need to fix? I guess... Meha, maybe you're the best person to answer that question.

**Michal Kawka | 13:57**
Not that I'm aware of. So the only critical thing was the XSWIT job and the job that basically checks which... You're currently on it was fixed today. It was reviewed by Rinor. It was tested by Rinor and I. We paired up today, we had a call, we tested it, we deployed it, we merged it.

**Wesley Donaldson | 14:18**
Okay, sorry, I apologize.

**Michal Kawka | 14:19**
Harry tested later on the on prod.

**Wesley Donaldson | 14:23**
Cutting you off, we don't have to do status like don't worry about that. Like I'm I need to be focused on like what are we going to tackle going forward?

**Michal Kawka | 14:27**
Okay, sure.

**Wesley Donaldson | 14:30**
So don't worry about... We're playing on status. All right, let's pay it then. So let's... The next ask from this... Bit of a long... Notes is this idea around what we can do to get better visualization of what's going on.
So a dashboard of some kind using our existing AWS infrastructure or tooling, maybe doing a cloud dashboard or something to that effect. So this is geared towards creating a dashboard that brings some transparency to things like, "Are there D LQS out there? Are there a lot of UMS piling up inside of the DLQ? Is there similar such events?"
So the goal there is just... One is CloudWatch Dashboard, the right tools. I'm thinking maybe a spike to get to that decision. Everything that I have seen in the conversation today and Antonio, correct me here, sounds like it is still a valid tool that we can use. Most of that's available in CloudWatch.
But just having a conversation around what the things are... Then is CloudWatch the right tool? Since we're going to be using emitting and manifest events for all of our Lambdas or all of our implementations like defining the schema for that Lambda. Great. Now we have a schema. We haven't done anything with it.
So actually creating a Lambda that emits events relative to what it's seen from the other Lambdas out there in the world actually builds a dashboard based on what's coming out of the emitted events. This I threw in there because it was a conversation.
Maybe I know there's already an alert for this, but do we need to have something specific by age? For example, if something dies, if something is in DLQ for greater than x number of days, 14 is the max right now.
Maybe anything that's there for 10 days or 5 days and hasn't been resolved is a different kind of notification. Maybe someone comes to your house and breaks your knees or something. But I don't know.
Do we need something that's a little bit more than what we currently have?

**Michal Kawka | 16:36**
To be completely honest, I don't really think so. I hate to say this as an engineer, but we need a process. We don't need any new shiny tools or dashboards. We need a process because we already have alarms.
I mean, this specific issue was something else. So there was a human error, right? Which was basically an implementation fault because we are switching legs in a wrong way. But on the other hand, we have alarms, and we have alarms for those event buses, which notify us when we haven't parked any event for 24 hours or whatever. I don't know the exact numbers, but we do have alarms. The problem is no one is still checking them.
So I think we need a process when we have a weekly shift or something where a developer is responsible for monitoring the channel with others.

**Wesley Donaldson | 17:26**
Yes.

**Michal Kawka | 17:39**
Because I think the process should be if we go ahead, I would say like a scale.

**Wesley Donaldson | 17:44**
Sorry, this distance... I agree with you, Meha, I agree with you. That's literally the goal of this day. You as the most knowledgeable person at the moment, asking you to get to... What is your process?
Then my intention is to distill that down into what is the actual repeatable process. Please move. What is a repeatable process that we can now have? Myself, all of the engineers who are responsible for...
I think it's unfair to ask if no one's responsible, if sorry, if everyone's responsible, then no one's responsible because everyone else thinks someone else is doing it. So the goal is, once we get to clarity on that, we'll actually have a schedule like, "Hey, Antonio and West are responsible on Mondays and Wednesdays, right?"
I mean, everyone's always responsible for honesty, but literally saying no, it's on you this day. We need to be clear on how to go about doing that review. Not everyone's as comfortable, I would say, as you are.
So that's the answer to this... Let's... That ticket will basically inform this effort. I wouldn't say that's a ticket, but that's effort. What about the other items here? Are there other tasks or things that we need to do to get to this idea of this manifest dashboard?
Sorry, of this reporting dashboard.

**Michal Kawka | 19:06**
To be completely honest, I think that in terms of blue-green because that's the main goal of this meeting, we have enough information and enough visibility because first of all, we have a GitHub action that can check the status of the legs before you execute the actual switch.
So there's a job check, leg status, and switch legs, which inform us if they are in sync. So what's the current state? Where is the front end? Where is the supergraph? Where are the connectors, and all that stuff?
So you basically run the job in GitHub, and it tells you, "Okay, we are currently on green, we are currently on blue." If you switch, you go to the other direction. We have security measures in the switch job itself
because we don't just run the job, we have security checks first, so we verify if all stacks are in sync. So we had situations before where this saved us because the job basically failed because the prechecks weren't fulfilled because the stacks were out of sync for various reasons. That can happen in AWS, but this time the check was simply faulty.
So like I mentioned before, we were checking the target groups based on the ordering of an array which is random. So that wasn't a proper health check before the leg switch. Now we do have that. So I think we have enough visibility and enough tools to detect that something is wrong.

**Wesley Donaldson | 20:36**
Okay, that's important. That's so... Hold on, that's a very important thing.

**Michal Kawka | 20:37**
The problem.

**Yoelvis | 20:39**
How can we...?

**Wesley Donaldson | 20:42**
I think we need to come to a resolution on that idea that we have enough instrumentation. I think the general idea from Sam was that this is encapsulating blue-green, but it's bigger and in theory allows us to have just generally more transparency.
So I guess that's my question to you. Do you feel this is a valuable effort? And on a larger scale, and maybe not so much for BlueGreen because we have enough instrumentation around that. Or do you think this is not a valuable effort at all relative to the environments?

**Michal Kawka | 21:16**
We definitely have enough infrastructure and tooling around BlueGreen, but we definitely would benefit from more detailed dashboards. You know about different parts of the app because in the dashboard currently we, for example, have the disk usage.
So there was an alert about that for... By the way, but no one checked that. So we have dashboards about disk usage, we have dashboards about the events, we have dashboards that tell us about the current network usage and all that stuff. We definitely can add more value to that, but only considering that someone is looking into that.
We have valuable alerts that come to us and we don't ignore. So in terms of the BlueGreen strict, I think we have enough tooling and visibility. But I'm happy to disagree and be proven otherwise.

**Wesley Donaldson | 22:19**
Well, so let me put that question to you, Antonio, and to you all as both engineers who are relatively new to this monitoring report, this implementation, do you feel it is a transparency issue? Is it that I just don't know what's out there versus a coverage issue?

**Yoelvis | 22:45**
Yeah, no, I see what Miko said. If we already have accessibility tools in place and we are not taking action when we have an alarm or something like that, we just don't need to add more observability. We need to start by having ownership of what we have now and taking care of everything that we have at the moment.
If we are not even handling the current alarms, we should not be getting new ones because it's like...

**Wesley Donaldson | 23:21**
Yeah, I don't think it's an alarm we're looking to create. It's not like a dashboard where you literally... It's more like a central location where all the various reports all come together in one area for you to be able to make a decision, to see an issue, and to make a decision.

**Antônio Falcão Jr | 23:24**
I have a slightly different opinion.

**Wesley Donaldson | 23:43**
So I guess the real... It goes back to this really... Do we really just have the stuff we just don't use? So isn't it just that we need to create not just a document because no one reads those?
But is it a document? Then more importantly, in onboarding, that every engineer and manager has to go through relative to the environments that we have deployed and someone has to keep it up to date. Is that the underlying problem?

**Antônio Falcão Jr | 24:17**
I see it as complementary work. I understand the team's perspective on better delegating this responsibility. Absolutely, that's a thing that we must solve. But at the same time, the improvements are really welcome.
So I would include a central integration to this dashboard somehow, and we do have those letters right there. Yeah. So I believe those are complementary efforts in my opinion. So someone looking for that...
But when we are looking, we have enough information to take faster decisions and more assertive ones. Absolutely.

**Wesley Donaldson | 24:58**
Okay, yeah.

**Yoelvis | 25:00**
But in practice, what's the thing that we want to put in that dashboard?

**Wesley Donaldson | 25:00**
For...

**Antônio Falcão Jr | 25:07**
I think all the environment metadata we could. That makes. Makes sense. I can make a work to list those, but, kind of a snapshot of the environment would be nice to see absolutely the dead letterers and the centr centry informations.
Like some code level debugging or some business level metrics. Maybe. Would. Would be helpful.

**Wesley Donaldson | 25:34**
So I have the business-level metrics idea here. I think that...

**Antônio Falcão Jr | 25:38**
Good.

**Wesley Donaldson | 25:39**
So to answer the question of why what new are we adding and what value is it going to deliver?
There is a... Has been very clear that we cannot have these kinds of issues that we're dealing with like PD, the printable PDF has been... We thought it was going to be something simple. It has a lot of legs and a lot of challenges that have come in that it's identified a lot of concerns within the system we've deployed. We cannot have that happen for commerce because it's money, it's orders, it's reputation.
It's much more critical if something like that were to happen relative to... You could imagine someone showing up to a plate to a screen location, and we don't have what they need. We don't have the system set up where they can actually go through and get their test, their diagnostics, right?
So the thinking is, what can we get? We need to get ahead of not what, but what? What must we do now to ensure that we have that level of transparency, that level of trust in the system, and nothing is ever 100% accurate when something fails. Not if when something fails. How we're able to react to it faster.
Maybe the answer is we don't do shit here. It's more about we add we build out the existing epics that we'll be talking about. That is specific for commerce. So the DLQ for the recurring orders coming into our system, right? For thriving for C-Star, maybe that's where we need to have XY and Z to make that more prominent to react faster.

**Yoelvis | 27:14**
Yeah. I think the sentury is doing a very good job because we can catch all the errors in the Lambda and things like that. That's one thing. I am getting those emails from sentury, and I look at them, and I try to identify where the actual issues
are. But yeah, we need to add more.

**Wesley Donaldson | 27:39**
Well, hold on. So but maybe that's the thing right there. That's for the other epic, but it shouldn't just be you getting it looking through emails. Is it you, Jennifer Stays, or who is responsible for reviewing those emails? What is the central location? Is it really just Emailbox? Is there a central dashboard that Century offers that you should be moving to?

**Yoelvis | 28:00**
Now, in Century, you have the dashboard, but they notify you through email.

**Wesley Donaldson | 28:03**
Exactly.

**Yoelvis | 28:06**
We can set up a channel in Microsoft Teams if we want, but it's just... The way I can get the notification quickly...
But you can go to Century, and you will see the notification is being sent to all the Century users, and yeah, I'm included. So for that reason, I'm getting the notification.

**Wesley Donaldson | 28:31**
Right. The.

**Yoelvis | 28:32**
I agree with you. We need to make sure we have someone with ownership or responsibility of looking at those efforts and incidents or whatever and create the ticket or react to them rather than just a list of people getting the email and the notifications and no one doing anything.
Because we say, "Okay, maybe Jennifer's going to do it, or maybe you have this," but it's like we don't have a real ownership. I would say Jennifer could be a very good fit for looking into those issues, but yeah, all libertative.

**Wesley Donaldson | 29:16**
Okay. Yeah. Okay, I hear that. I think this is even... I'm hearing this is the most important thing right now. I do want to just challenge us on this idea here, and we'll bring this back to architecture.
But I want to be able to go back with more than just the perspective that there's already enough architecture there. Sam is aware of what we have in the architecture. So him putting forward the idea of having this central emitter around specific metrics and specific data that we want coming out of the system is that valuable from this group's perspective?
Don't be shy. No one's gonna bite your head offs.

**Yoelvis | 30:08**
There is something that I want to know, and I don't see it in the Slack status. Mia, maybe you can help me. But when we merged the code to main, how can we know what the code that is using every leg
is? Because if the active leg is green, it may be using a commit that is different than blue, even though main is the source of both. But is there a way to identify that? To say, "Okay, this is using this particular commit, and this one is using this particular commit."

**Michal Kawka | 30:52**
Yeah, so that's the thing that release notes are supposed to solve. So we have a disk view, where you can basically go to the URL, and you can compare two legs. So, for example, if you are on next because there's next.livelinesbook.com and test@likeninesenbooks.com.
So one of the legs is currently active, and one of the legs is, of course, the preview leg. So if you use the compare function on those two URLs, you can see which branch is ahead. So you have clear information which commits are in which branch under the assumption that developers are using the release notes.
So that's currently the only way to do that. You could probably dig into AWS and look at the commits or whatever, but that's supposed to be the most straightforward and the easiest visual way to basically compare which branch is ahead and which is behind.

**Yoelvis | 31:57**
Yeah, because we had a lot of issues during the past week that every time we deployed something, it was working, but then when we changed the leg, it was not working. The GraphQL API, especially.
Then we had to switch legs again and say, "Okay, how do we identify what is the leg, and what's the code that was deployed to use to deploy that particular leg?"

**Michal Kawka | 32:29**
Yes, I think we need to enforce. Most likely starting next week and forcing everyone... I need to look into that because CO reports some issues today, but I think we need to enforce everyone to use the release notes because this will give us clear visibility of what's currently deployed, which leg.
So that's the easiest way to verify what's on your next... What's on your current leg. That's going to be... Because you definitely... I'm not 100% sure, but I think that there's definitely a way to check that in AWS, but who wants to go to AWS to see which comet is currently deployed? We want an easy way to know that.

**Wesley Donaldson | 33:18**
So... Yeah.

**Yoelvis | 33:18**
I think that we could use the commit number in addition to that because that way you can know exactly what the state of the repository is in that particular deployment.

**Antônio Falcão Jr | 33:36**
But guys wouldn't be this dash to give us this... Between environments. I was under the impression... So we could look and realize really... That they are... That's correct.

**Michal Kawka | 33:49**
Yes. So that's the idea of the view. So you go to test.live.line.sandbox.com... You give a parameter compare... You basically pass the URL of the leg you want to compare against and then you get that visual...
So that's how it's supposed to work under the assumption that developers are using the release notes.

**Yoelvis | 34:16**
But, well, I don't understand. How are the release notes related to that? Because does... Git... Get stuff? It's like commits and things like that. How are the release notes related to that?

**Michal Kawka | 34:32**
Let me show you a screenshot I shared a while ago. It will most likely clear things for you because it basically shows which PR was merged on which and deployed to which branch. Let me...

**Yoelvis | 34:53**
Because I wanted to say, like, a diff in the code, not a diff in just the PR release note.

**Michal Kawka | 35:04**
But what's the difference? So if something got merged, if AR PR got merged, then release notes tell you what was currently merged. This branch... So I mean to describe...

**Yoelvis | 35:13**
I trust the code more than the node. You know, it's just my...

**Michal Kawka | 35:25**
To be completely honest, I can't imagine how this would work and what you envision. But of course, I'm happy to... If that's a reasonable solution that everyone thinks is useful, I'm happy to either implement that or use that.
But I don't see your point right now.

**Yoelvis | 35:46**
No, it's just that you can say, "Okay, this is the commit number for this particular deployment."

**Wesley Donaldson | 35:51**
Hash.

**Yoelvis | 35:54**
Commit #. Okay. This is the commit hash for the other deployment. I can go to GitHub and I can compare both.
It's like we just need to record the number and the hash of the particular commit that made it to the deployment that made it to the deployment.

**Wesley Donaldson | 36:11**
So just a reminder, we as part of the implementation... So hold it as part of the implementation.

**Michal Kawka | 36:12**
Absolutely. Okay, I see your point. Okay, now I see your point.

**Wesley Donaldson | 36:17**
We talked about doing exactly that as the backup right where we're going to... Probably it's not... Maybe it's just integrated into the overall solution that the LLM is using.
But the big concern was that's for engineers and the release transparency. The release transparency epic. That's what we called it. Its goal was to service non-engineers. So someone who's not comfortable getting to two hashes and then doing a diff between them.
So the release notes should be as meaningful as it is to an engineer as it is to a manager.

**Michal Kawka | 36:48**
Exactly.

**Wesley Donaldson | 36:53**
The output currently should be a summarized view of the diff that a git diff would have generated.
So it could be a fidelity issue. We need to improve the value of what's in the report. But currently, it needs to service both needs. It could be a simple L versus just adding that two hash codes, and then you can use those to do your internal investigation.
But let's not forget that business users need to use this as well.

**Yoelvis | 37:20**
No, of course, I totally agree. I don't say that we need to remove the release nodes. I just say that for troubleshooting and things like that, as a developer, it's more useful to go through the code rather than the node that the developer could or could not leave.

**Wesley Donaldson | 37:38**
I mean, I show your Git, but in my mind, the last Git commit shows a field and the report.

**Michal Kawka | 37:50**
I can't find the screturees right now. They shared with you before the demole. Let me reach up. To much was.

**Wesley Donaldson | 37:56**
Seriously, sorry. We're very off topic, but I hear that need. I think the answer is let's use the AI working session this week because we're all... Folks are a little bit light. Let's use that to close the loop on getting everyone using the release notes.
If we can get that hash in there that allows engineers to be a little bit more... In a familiar environment, I think that's a simple ask, a simple addition. All right, I'd like to give folks some time back.

**Michal Kawka | 38:26**
Agree? Yeah.

**Wesley Donaldson | 38:28**
We're at 02:10. We need to get to a top line for this.
I think we need to address this concern. Me? How? I would probably... Let me ask you to give me one of your beautiful Markdown documents sharing a perspective on this. I think it's a conversation we need to bring back to architecture because that's where this came from, and let's have that conversation there.
I will build out the epics. I think at a minimum, we have a couple of tickets here that we can do. I will build out the first two epics, and then I'll pause my effort there. I think at absolute minimum, this ticket here is valuable. As a matter of fact, this goes here, right? This is this effort and this effort as well.
Because you... is not convinced. So let's get him bought in or let's realize it's a bad idea. So let's say this epic we'll tackle next week, we can get to resolution in that. I think that combined with this artifact from you and me how we can bring into Tuesday's meeting.
So maybe taking a look at this and your perspective here. Then we go into Tuesday, we have more information, and we have a conversation. Does anyone disagree with that approach? If you do, please propose something different.

**Antônio Falcão Jr | 39:52**
No, that sounds good to me.

**Yoelvis | 39:53**
Yeah.
Yeah. Sounds. Good.

**Wesley Donaldson | 40:01**
Okay, all right, let me build out the epics. We'll table it here. I'll share the epics with you guys. You give me some feedback on that. But the plan is to have this conversation at Tuesday's architecture meeting.

**Antônio Falcão Jr | 40:14**
Perfect.

**Wesley Donaldson | 40:14**
Important call out: I'm more concerned with instrumenting visibility on commerce work.
So if this is just to get us grounded and then when we go into the commerce work, then we have all... What specific dashboard do I need here? What specific projection do I need to build to support whatever BI needs? This is just some of the stuff that we called out already.
We can have that conversation over there, but my thinking is this, at minimum, is a stand-alone effort that we can do now. All right, guys, thank you so much for the time.

**Antônio Falcão Jr | 40:50**
That makes sense. Yeah.

**Wesley Donaldson | 40:53**
Antonio, I still owe you a couple of epics and, well, some tickets relative to commerce, so I'll work on that now. Then I'll send those over to you.

**Antônio Falcão Jr | 41:00**
Right. Okay, no problem.

**Wesley Donaldson | 41:05**
All right, guys, thank you so much.

**Michal Kawka | 41:07**
Bye. Thank you so much, tax laterator.

