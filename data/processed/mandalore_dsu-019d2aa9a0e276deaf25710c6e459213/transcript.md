# Mandalore DSU - Mar, 26

# Transcript
**Wesley Donaldson | 00:36**
Good morning, all.

**Speaker 2 | 00:41**
Good morning, Mararet.

**Wesley Donaldson | 00:51**
Okay, so I'm going to get us started because I want to leave any extra time I can for us to just take a quick pass through the integration document, the state of integration document. So we'll just attack. We'll just get folks as they come in.
So let's start with you. Let's start Devon with you. You're not here. That's fine then, I can hear you.

**Speaker 2 | 01:25**
Yeah, sorry, I can hear you. So yesterday, I added the... We talked about the test cases playbook. So this morning I added that to Confluence. We spoke about maybe going through and testing the environment just to maybe find some of those spots that could be an issue.
So I'm going to do that, and update the playbook as necessary. I'll share that, and I'll share that in this chat as well, but in the Mandalor team channel.

**Wesley Donaldson | 02:04**
Okay, if I could ask you, just as I said, put it underneath the one recurring area so we can have it all in one place, okay?

**Speaker 2 | 02:13**
It should be there. Maybe it needs refreshing.

**Wesley Donaldson | 02:15**
Fresh? Yeah, I don't worry about it. Alright. Let's go to Francis next.

**francis.pena@llsa.com | 02:26**
The... What is it? The first one in the right there. Ready for prop. That one. I shared the keys with Jeremy a few minutes ago, so he should be able to set up a Confluence with this to connect to the...

**Wesley Donaldson | 02:39**
Okay.
Okay, can I then review just...?

**francis.pena@llsa.com | 02:47**
So I think... Okay, that's fine. We still need to test that. So once he has set it up, we can test.

**Wesley Donaldson | 02:59**
Okay, all good. I saw you closed out the APA security and the whitelisting, so just that's good as well.
Nothing outstanding from your perspective on the connection between Recurly and us.

**francis.pena@llsa.com | 03:12**
Yes. The entries for the web API endpoint... That's still depending on Infra. I raised that this morning with them, so I hope they can fix that today. So the endpoints that we have that I shared in the chat with Jennifer that are not working yet...

**Wesley Donaldson | 03:30**
They're not working yet. Okay, got it.

**francis.pena@llsa.com | 03:32**
No.
Until that is completed, then working that is a link to that one.

**Wesley Donaldson | 03:35**
Yeah, I'd rather have a ticket that represents that. Still, this one right here, you're ready for...

**francis.pena@llsa.com | 03:41**
If you open that infra ticket...

**Wesley Donaldson | 03:44**
Okay, cool.

**francis.pena@llsa.com | 03:44**
Yeah, there's a ticket link to this. That is for improvement.

**Wesley Donaldson | 03:48**
Okay, I see it's seen in... Perfect.

**Antônio Falcão Jr | 03:50**
One, yeah, guys, I have this... A great... LLaMA in review, please take a look when you have a chance.

**Wesley Donaldson | 03:51**
Okay, sounds good, thank you. Antonio, are you with us? Yes, you are. What do you need next, Antonio?

**Antônio Falcão Jr | 04:11**
Yeah, it's pretty much the... Yeah, we are adopting... As a framework for this, and we are creating a new event store on top of Postgres, and we are using inline projections and workflow for reactors.
So really nice work.

**Wesley Donaldson | 04:31**
Okay, can I go a little harder on this one? Can we have someone raise their hand to do the review for this? This is pretty critical for our flow, and I don't want this to go multiple days waiting for a review.
So who has bandwidth? Who can take on a review for Antonio?

**Antônio Falcão Jr | 04:52**
Think of me... Help... And go ahead.

**Wesley Donaldson | 04:53**
Okay, me out. Thank you. Do you want to go ahead?

**Antônio Falcão Jr | 05:03**
No, I was just about to say that the one in progress has no. No block in. So I just have to make a change to the reactor to... Right up to deconfigurations now. Yeah, that's pretty much it.

**Wesley Donaldson | 05:25**
Okay, I don't have a sub task for it, but I think we're all we all touched on this. Like if you could just craft the aut renew version of this str this page that we. Jeremy sorry, Lance gonna kind of keep moving and doing his testing.

**lance.fallon@llsa.com | 05:44**
Absolutely.

**Wesley Donaldson | 05:45**
Cool.
I love a good segue. So to you, Lance.

**lance.fallon@llsa.com | 05:53**
The Slack event grid stack, there's a PR open for something somewhat related to it. I did... I dropped the comment on Antonio's PR, "We will need the unit amount for the membership." Right now, I'm just mapping that to null in the data that I send to the event grid.
So I didn't know if we wanted to make that update in Antonio's existing PR or get our stuff merged inch and do that as a separate task.

**Antônio Falcão Jr | 06:35**
Lu co. Let' let's take it off line and then we let Wesley know.

**Wesley Donaldson | 06:43**
Yeah, just take a look at the notes on that ticket line. I think Jennifer had explicitly said that Jennifer or Beth had explicitly said that we wanted a zero unit amount. Think it's in one of the notes or one of the technical notes.

**lance.fallon@llsa.com | 06:55**
Okay. If we're right, if it's going to be zero, then I'll just update it to zero in mine.

**Wesley Donaldson | 07:06**
Any concerns, any blockers, anything you feel confident about? Team, as a reminder, our goal is to basically be pencils down feature complete. I understand that during testing we find something but be feature complete for tomorrow. Anyone working on something where they feel they will not get to a PR by the end of the day, or will people block in getting to that goal?
Please raise your hand so we can support getting that to the finish line. Okay, let's keep going.

**lance.fallon@llsa.com | 07:34**
A new stack hasn't been deployed yet, so I think it'll be ready by tomorrow. But once the PR is complete and we deploy it, I'll let you know then.

**Wesley Donaldson | 07:47**
Is there anything where maybe Francis can push a little bit to get us a little bit of priority in the stack deployment? I'm not sure. That's a trigger. We can pull a lever.

**lance.fallon@llsa.com | 07:59**
I don't think. I don't think we need anything like that. Just since I haven't seen it get deployed yet. I don't know how that's going to go.

**Wesley Donaldson | 08:08**
Understood? Okay, just keep an eye on it, please. Just like in today's meeting at 3 pm eastern time, please just give us a status on that. Okay, let's keep going. Me? How are you?

**Michal Kawka | 08:23**
Everyone. So I wrapped up the implement tracking tag ticket. I'm going to test it now. LBS already started reviewing that, so thank you so much for that. If everything looks good, I'm just going to merge it later today.
I think it should be possible to test it on dev because the ticket says the dev container ID is available on the parent epic, so I assume we will have something to test against that before we go to prod. I might reach out to someone for...
To configure the stuff for me as a GitHub secret because I don't have access to GitHub secrets. In terms of the other ticket that chat is still blocked. So I might work on Playwright in the meantime. Once I'm done with the tracking tag.
Unless there's anything more urgent I can help with.

**Wesley Donaldson | 09:22**
Yeah, if you could help with the review, that'd be a good one to help with. Sorry, go ahead.

**Yoelvis | 09:29**
I can't help you with adding the environment variable. Okay, great.

**Wesley Donaldson | 09:37**
Just on the tracking, Beth, I think you're here with us. So we have the dev one. Do we have the production version yet?

**Speaker 8 | 09:46**
No, let me reach back out. I reminded Doug of that yesterday. So let me see if you've had a chance to look at it.

**Wesley Donaldson | 09:54**
Okay. It shouldn't be any development from that since we're going to put it inside of a secret.
So not like on fire, but we definitely should aim to happen early next week if we can. The latest... What can we do, Jennifer, myself, Beth, anyone? What can we do to help unblock this? It's exclusively outside our control.
It's just on Rob to get us... What do you need to unblock this?

**Michal Kawka | 10:22**
It's on Rob. So we already have a chat with Beth and Rob, so we're in touch. It just needs to be configured for dev and prod so it can be used. Because without that conflict, I'm completely blocked and can do anything.

**Speaker 8 | 10:38**
Let's just mention Rob in the comment and ask him his ETA on the configuration.

**Wesley Donaldson | 10:59**
Okay, alright's keep going. We didn't touch on. We didn't go to u. Jeremy Apologies.

**jeremy.campeau@llsa.com | 11:12**
No worries. I was late. So Francis gave me the keys for prod and Devon test environments for the event grid. So now all those are in my PR. Lance and I went over it, and it's good to go. I just need to actually merge at this point for the BI schema. I added a confluence page, and I sent it to Antonio with something I came up with.
But there are a few things I wanted him to look at. I left questions on it. Yeah. So, Antonio, when you get a chance to look at it, please. And Wesley, if there's anyone else that you want to look at it, I can ping them as well.
It's only the phase one items, just to be clear. Then for the other ticket, I have the one for the spreadsheet. I have the changes made. I'm just trying to test them and figure out if I can see them in the actual SharePoint drive.
So I'm trying to test that now.

**Wesley Donaldson | 12:13**
Nice. For the BI for the mapping, Tamk Ben maybe just message the chat for the meeting and just have the conversation there, so just make sure they're aware of what we're targeting.
If you could include the spreadsheet in the confluence page inside of the ticket as well. So we have it one place tracked and then share that in the chat and the meeting chat and start getting some feedback on it.

**jeremy.campeau@llsa.com | 12:39**
Which meaning chap?

**Wesley Donaldson | 12:41**
The one from... Sorry, you may not have it, I'll send it to you.
I'll send it to you off the call.

**jeremy.campeau@llsa.com | 12:47**
Okay, sounds good then. I'll throw the confluence page as a comment on there too.

**Wesley Donaldson | 12:51**
Perfect. Okay. You all this to you. Finally.

**Yoelvis | 12:58**
Hey, I've been reviewing PRs and having discussions with Jeremy. We found a couple of details that are not okay in the e-commerce, and we are working on those ones. In addition to that, I'm trying to reproduce the issue with the slash appointment in... I see this happening on the dev environment, but I don't... Basically, in the sandbox.
But I cannot reproduce it locally, but I am trying to figure out what's going on.

**Wesley Donaldson | 13:43**
Maybe we're getting a different environment to have a PV there since it's not happening in local. It could be.

**Yoelvis | 13:48**
Yeah. The production environment is completely broken at the moment, so it's. It may be worth taking a look because the back is... No, it is returning an internal server error.

**Wesley Donaldson | 14:06**
No.

**Yoelvis | 14:06**
I don't know, maybe we need to... We messed something up with one of the deployments or... I don't know, we need to fix it.

**Wesley Donaldson | 14:16**
Okay. Who's the best person for you to pair with to kind of work through that as a triage? Is that just goes the best person since he had so many, so much of the UI and part of the CD K work. Or is it Antonio who had most of the CDK initial CDK work?

**Yoelvis | 14:35**
I don't know who is... Who knows very well the blue, green, and everything else? Maybe Francis or Antonio can help him with that.

**francis.pena@llsa.com | 14:47**
Yeah, I can. I can have a look at it.

**Wesley Donaldson | 14:52**
Can I ask you guys just to please message back the teams channel? That's pretty urgent. I want to see if we can add... Capture a ticket for it or just get to an understanding if there is a blue-green issue.
So if you could message back the channel or myself directly, maybe target before the 3 pm meeting. Okay, one additional... Giffco, unfortunately, had a... His daughter's not feeling well, so he's running to pick her up from school. His status is he's still working through the coupon entry and checkout, as well as the other UI component.
Sorry, the UI element for updating for a member. Updating that to minus $30 when you add a membership inside of the checkout flow. So ticket number 7903, and he's still doing some cleanup on the PR on 7411. Quick one for you. You're... Not sure if I saw it.
Yeah, you did have it. Okay. So this is... You have this in PR review. Who's the best person to get a review on this? Is this maybe Jeremy by virtue of his just proximity to Recurly and the order flow that...?

**Yoelvis | 16:07**
I think it's lens. I'm going to send the PR but...

**Wesley Donaldson | 16:15**
Okay, perfect. All right, guys. So can I ask everyone to please be very diligent around your PRs? We have a couple of days outstanding to get to our goal of having the full checkout flow working end to end. Our timelines on PR as a team are not ideal.
So I could please ask you if you need a PR to get something that must be delivered by an update tomorrow for testing this week and next week. Please prioritize reaching out to someone to force the issue.
Please get yourself a PR review. Help. If you're not getting one, please reach out to me and I'll help push them forward as well. Anyone? Any questions, concerns, or anything they're not clear on?

**francis.pena@llsa.com | 17:01**
I have a few things if just a couple of minutes if that's time. So first is the endpoints that I mentioned about Webbook that are working now. Then we just finished that. Second is that we have blue-green for the webhook stack, but we don't have the switch.
So if we can have a ticket for that, we can work on it. So that we can have a switch Slack for that and thirteen is... I'm forgetting now.

**Wesley Donaldson | 17:26**
Okay, so the number one, we with a bullet there, we need a script for actually doing this switch between blue-green.

**francis.pena@llsa.com | 17:37**
Okay, forgot about it. Let's see if I remember later.
Yeah, we need to add it to the deployment so there is a workflow for that with the other components. We just need to add this one there so that it can be ticked. I can work on that.

**Wesley Donaldson | 17:57**
I think that may be a bigger conversation. Yovis Antonio Giffco as well, if you were here, the idea that the blue-green switch that we have in the main application repo is the same blue-green switch for the recurrently specific work.

**francis.pena@llsa.com | 18:23**
So I guess the question is if we want to have it in the same because there's nothing now for at least for the web, we don't have it. The switch is not there. There's no switching like a workflow for switching.

**Wesley Donaldson | 18:32**
He.

**francis.pena@llsa.com | 18:35**
So I guess the question is if we want to put it in the same workflow as the other components or the other things, or if it has to be separate, I guess.

**Wesley Donaldson | 18:45**
I'll create a ticket for us to put it in the existing flow and then we can address it as a team in architecture, in the architecture chat or in the three or 3 o'clock today.

**francis.pena@llsa.com | 18:58**
Sounds great. Sorry, I just remember the other thing. So we have booked for the frontend booked at Lifelong Sabook that book that lifelinescreening.com, we haven't switched that. Do we want to do that? When?
So I can work on that but we still haven't switched. We're still using the temporary... Yeah, domain subdomains... Yeah, exactly.

**Wesley Donaldson | 19:22**
So by fix, you mean we haven't adopted using that within workflow. Is it currently correct?

**francis.pena@llsa.com | 19:29**
Do you want to do that?

**Wesley Donaldson | 19:30**
Is it currently pointing to the correct S3 bucket? Is it effectively live? We're just not using it.
And the real the realt.

**francis.pena@llsa.com | 19:36**
Yeah, it's not using a... It should work, so it's just the application conflict.

**Wesley Donaldson | 19:38**
Okay, so the task there is just to set up a great task for actually switching out temp to booking on the application config.

**francis.pena@llsa.com | 19:40**
So it's a GitHub variable. And redeploying. That should do it. Yeah, correct. That is all for me. Sorry.

**Jennifer | 20:02**
I have something I wanted to introduce you guys to. New employee we have Willie. He sat in on your guys' standup today. So he's our new senior software developer and he's going to be on the Endoor team.
But I wanted to have him meet you all in the Mandalor team. So, Willie, I don't know if you want to say a sentence or two about yourself again. I know you've said it to a few different groups, but if you want to do that here and then we'll go around the room and have everyone introduce themselves.

**Speaker 11 | 20:41**
Okay? Thanks, Jennifer. So, hi, nice to meet you guys. So this is Willie, and I've been a software engineer for over a decade. I'm a TASCRIPT-no-JS guy, and I have some experience on a of CDK and hope to learn from you so much and excited to join the team.

**Antônio Falcão Jr | 21:04**
Welcome, Willie. My name is Antonio. I'm from Brazil. I work as a principal software engineer on the Showvill side. So really glad to have you here, man. If you need something, let me know.

**Wesley Donaldson | 21:19**
I can go next really quickly introduce myself already. But Wesley or West, for short, technical manager with the Mandalor team part of the ZLVIO group as well. But as always, welcome anything you need, just let me know. I could nominate the next person down.
So, Devon. You're the next in the chat window. You're on me, bud.

**Speaker 2 | 21:49**
Sorry about that, I was muted. Welcome, Willie. I'm Devon Woods, QA engineer. I work out of Akron, Ohio, so pretty close to the Independence office. On the M&A Lord team. Excited to have you reach out if you need help or like to talk, and I'll nominate Jeremy if he's on.

**jeremy.campeau@llsa.com | 22:17**
Thanks, Deebn. I'm Jeremy Campo. Nice to meet you. I've been here for just over a year now as a software developer. I worked on our Shopify integration, and I'm working on the Recurly one right now. I am located in Boston, Massachusetts.
I think it's opening day. So go Red Sox. I will nominate Lance.

**Wesley Donaldson | 22:40**
The thin glass dropped.

**jeremy.campeau@llsa.com | 22:41**
Did he disappear? I don't know if I see him on here.

**Wesley Donaldson | 22:46**
Yeah. He dropped.

**jeremy.campeau@llsa.com | 22:48**
Okay, I'll go with you all of this then.

**Yoelvis | 22:52**
Hey, Willie, I have already introduced myself to you a couple of times, but... Yeah, and you have... Is a principal software engineer, and I've been in the company, I guess, for over a month now.

**Jennifer | 23:13**
Did we get through everyone?

**Wesley Donaldson | 23:14**
Four.

**Michal Kawka | 23:17**
My not mi.

**francis.pena@llsa.com | 23:18**
Ki miha me I guess.

**Michal Kawka | 23:22**
But feel free to call me Michael, it's easier to pronounce. I'm part of the Soviet team. I've been there for a year, I believe, or even longer. Yeah, happy to have you on board, and I'm a software engineer.

**francis.pena@llsa.com | 23:40**
Hi, Willie. I'm Francis. I'm from the Dominican Republic. I'm a Web engineer. Welcome to the team, and if you need anything, just shout. You're welcome. Thanks.

**Jennifer | 23:55**
Thanks, everyone. Appreciate it. Welcome, Willie. Thank you, guys.

**Wesley Donaldson | 24:00**
So. By. For now.

**jeremy.campeau@llsa.com | 24:05**
Have a good one. Bye.

