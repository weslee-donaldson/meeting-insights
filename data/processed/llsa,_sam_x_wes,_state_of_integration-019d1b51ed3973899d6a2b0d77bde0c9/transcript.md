# LLSA, Sam x Wes, State of Integration - Mar, 23

# Transcript
**Wesley Donaldson | 00:01**
Just like it. Looks like somebody punching it out. I'm like you. No shit. As long as you said it wasn't my husband, I...
Good morning.

**harry.dennen@llsa.com | 00:40**
Starting to wonder if this call's going to happen because I know there's a sales call. I just found out Jennifer is out until Wednesday.

**Wesley Donaldson | 00:50**
I thought she was back in the morning tomorrow. My goodness, that that's inconvenient, very important timing. It is what it is, but, like, let's. I mean, I'm happy to. This is recorded, so I'm happy to walk you through, Mandalore's status as if you were Jennifer and Stace and team.

**harry.dennen@llsa.com | 01:15**
I don't think that's going to help me much because I'm focused on my thing, but there is some stuff we can show about...

**Wesley Donaldson | 01:22**
Can. So.

**harry.dennen@llsa.com | 01:24**
So there are two things. So one was the build, the production deploy because the dead smoke test stroke.
So Mihal's got a PR going that says... So it looks like when Dane added... Because now we've got some time-based changes. So I'm jumping around. They added the fix to limit account creation and cognito. One of those limits is time-based or specifically the order one.
So in the smoke tests, the order wasn't there and so we didn't create an account, so the test user never got created.

**Wesley Donaldson | 01:59**
Street in your town.

**harry.dennen@llsa.com | 02:06**
So this is expected to fail, right? The question I have is why didn't we see it when Dane's PR emerged to Maine, right? There were like five or six or seven bills that happened subsequently and they all passed.
So we're looking at it and I think what's going on is that when code is merged to Maine, the dev deploy deploys, but then the tests are run on a different leg, right? So if green is the active dev leg, everything will be deployed to the blue leg.
But when the tests run, I think they might be running against the green leg right? The live leg, which would mean that you wouldn't see those failures until we do a leg swap.

**Wesley Donaldson | 02:54**
Until when? Next time I'll come and we... Then Lu Green is now switched.

**harry.dennen@llsa.com | 02:58**
Well, no, because it's not... The builds don't switch.
It's still a manual switch, right? So if nobody goes and changes the leg after the deploy, you won't see it. So we were looking and we found that when they started failing, there was a dead leg switch.
So I think that's something we got to fix because it means that we could be merging code that is broken. Like, luckily this wasn't broken. It's like the test failed because we changed the rules, right?
But it was supposed to fail, so we're fine, but in the future this could be bad.

**Wesley Donaldson | 03:31**
Yeah, absolutely. Yeah, I think that's clear. I mean that makes perfect sense. Me how is working on one UI feature, but he's looking pretty good at getting that, getting APR up for that pretty quickly, so I'll write this up and get it over to him as a priority.

**harry.dennen@llsa.com | 03:45**
Awesome. Okay, cool. And then the second one, DJ is working on the membership renewal stuff effectively like turning it off or I'm not... Yeah, cutting it over.

**Wesley Donaldson | 03:57**
Coming it over.

**harry.dennen@llsa.com | 04:00**
So we've turned off auto account renewal in CSTAR and it's been off for a little over a week now.
He had some questions about some response thing and it depended on what Curly was doing. I don't have context on that. I think Jennifer might have, but I'm going to assume that somebody on your team will have context that he can chat to.

**Wesley Donaldson | 04:24**
Yes. Antonio would be the best person to speak to, and he would be the one taking that ticket on our side.
Actually, I did a pretty comprehensive analysis of how to do our portion of that ticket.

**harry.dennen@llsa.com | 04:30**
Al, right?

**Wesley Donaldson | 04:36**
So I have a good sense of the mapping, but I think it'd be better for him to pair with Antonio just so it's in real time.

**harry.dennen@llsa.com | 04:42**
Perfect. Alright, cool, I'll do that. So I'll just put two in touch with Antonio and then get his resolution there.

**Wesley Donaldson | 04:47**
Yeah, if he's blocked on something... As I said, since I did the analysis on how to make the ticket even work, just tell them to throw the question over to me, and I can at least see if that analysis covers that question.

**harry.dennen@llsa.com | 05:00**
I will do that. And that was everything I had that's got us into.

**Wesley Donaldson | 05:05**
Yeah. So on the...
What is that? Seven, seven something. 07:50 something on that same epic, the 07:24 08:24, I believe, was our ticket that we would take actually pushing the event into event graded. I guess my question is how we actually see... Right now we're going to trigger our own... The recurring events are going to come to us, we're going to get that pushed through into currently into current, and then we're going to react to that and send the event over to event grid. I guess my question is how are we triggering that?
Are we triggering that event right now? I think that's Antonio's question because we would need the trigger from a known set of users. Stephan and Jennifer did give me about 20 accounts. I guess my question is what is my test data? How do I play with actually running this through without impacting a user?

**harry.dennen@llsa.com | 06:01**
Yeah, I think that's going to be a DJ question when it comes to memberships because he's... I think he's got a full context on how it works currently in Cstar.

**Wesley Donaldson | 06:09**
Okay, all good, sounds good. All I got, let's see who else joined. Sam and Beth. Beth, you're aware of Mandalore? I can go back over that for you. Same, Sam.
If you want me to just take a walk through of where we are...

**bethany.duffy@llsa.com | 06:26**
I would prefer if we can drop it in the chat because today is a full meeting. So, the rest of the group won't be able to join. So if we can just write it down for them...

**Wesley Donaldson | 06:40**
Two.

**harry.dennen@llsa.com | 06:47**
I guess that's it.

**Wesley Donaldson | 06:50**
Sounds good.

**harry.dennen@llsa.com | 06:51**
Thank you.

**Wesley Donaldson | 07:47**
Well, it was fine. Good morning. Pretty good, actually. Okay, so starting from the leftmost, there's still a little more conversation now that is necessary on what the specific domain DNS is that we need for the production instance. Francis is leaning in pretty heavily, so I think we're good on that. He's setting us up. Which just some domain names part of that same conversation. Just the question of "Do we have everything we need for the production instance that FFCO has created?" The CDK was created, but some things were created, as effectively in duplicate stack, for lack of a better word.
The team... You all this flags some concerns, and Antonio agrees. So the two of them, the three of them, are pairing this morning and just getting everything they need to get the production instance of the CDK working. Confirming everything works with blue-green so no blockers there. Everyone is clear on what was needed. There's too simple task of just moving some lambs out of the CD that we originally created back to the original CDK stack, so no blockers or concerns there.
But there is some additional configuration work that's needed around the domain names and then configuring recurrently to use the proper domain names. Any questions there? So the environment right now... What you're saying is they're promoting extra production with the name...
So it's right take and look at your webbooks because that was the end of my questions like "What's stopping us? What's going into production right now?" So it's working on these. Yeah, and that's exactly what's stopping us.
We have the blue-green configured, but there's nothing that was actually done at this level to allow us to actually give a proper production URL to the Stripe production instance of Recurly and the obvious secondary stuff like key secrets and stuff like that wasn't done.
So that's resolved. We had a gap on security, so we now are configuring the API gateway to only allow non-act ingress points from Recurly. So some additional cleanup around that. That was done. This is in good standing. No modifications made to this.
Still working correctly. This is an unknown. They're already set up, they're working blue if they're already in that moment, so at least I can say, "Well, okay, I want to give into this." Sorry. Just what you want. Blue, green, because...
It's always too much of a mental load. Either it's not started or it's in progress or it's completely done, and everybody should be pushing. If we have too much to do, that's a problem.
Otherwise, it makes it okay to have too much. Got it. So I'm going to summarize that down to get rid of the black. Just put it as "in process" or basically there are three steps. You're working on it, it's ready to go, it's in production.
Well, it's not started, or it's being worked on or it's in production. Perfect. Okay. Then just the aim of the game there is not to allow too much blue to happen. If the entire system is blue, that's a bad smell.
Just to summarize there exactly here like we've got big... Get that and get that in production. Get the endpoint right there, test it as you see move onto the SUS, move onto the D LQ that way it's a smaller footprint work.
That's a good question. We shouldn't be atomically deploying this, right? Everything doesn't need to go together. Like there's nothing stopping this from going to production now. No, exactly my point, and if there is... Exactly.
Okay. Yeah. I'll close it out with the team today. But most of these are actually... As I said, the only thing that's unknown right now is actually right here on this connection line. We're not clear on how to prove this out. The team is... Well, it's just notifications.
Yeah, just like how do we... When something actually gets flagged by the LQ, what's happening? There's an alert on the CDK already, but we've not tested this. Well, that's what micro screen...
That's exactly. So that's what they're trying to figure out now, what's the best mechanism to test us without injecting stand up now? So as I mentioned, there are two calls at a stand up, but more importantly, there is an integration. 15 minutes where folks just... When challenges you're seeing we work them out as a team in real time so that happens at three o'clock. Me please just invite me to all things... Others this week please just... Every single calendar on your item on your calendars. Person by any... I really got to get in this week with the team and help accelerate some of the things. Help some of the things screen. I'm going to go myself if I have to. We have to show this last week of March. Perfect.
Yeah, I'll add to that, these are good. This is working really well. No issues with this currently obviously this line which I saw you add this... I'll ignore the color, but right now staying in the current flow. Antonio obviously worked on these over the weekend. Great conversation there. Looks like he has what he needs on this side up here. Rather, Jeremy and Lance are working in this level. Lance specifically, is taking on the connector coming out of current and then the lambda that translates that into event bridge.
That's into event bridge. So, I don't know. I'll confirm that. So let me tell him. If not... So ask him. Please. If he's not concurrent, if he's not set up for the preparation session, would you please find a slot on my calendar?
Basically, what I want you to do this week is accelerate everything that needs acceleration. With that person... So I can work with them and as I got to treat me as a catalyst this week. But I really needed to do this... Hop of everything that's dangerous.
So let's work actually. So that's one dangerous area I want to make sure is what's doing... So Remy's over here. Jeremy's working on the API grid. He has the ability already to push orders into CSTAR. What he's fighting with is just... He's seen some mapping error. Some under the hood like more minutiae items.
But he's already confirmed that he's able to push orders. He's just missing fields. Things are not... Are creating errors. So it's refinement at this point for him. One thing I did ask him to do is to prove what are our... How are we validating? Whatever we're getting coming in is translated correctly inside of CSTAR database.
So if we get in first name Wesley, the CSTAR has first name Wesley. How can we prove that? Okay, so Antonio is what I know Antonio is working right now. Antonio, he has two things. So one thing on his plate is the environment stuff.
So specifically, he's like... I asked Jeffco and them in our Zendesk channel, "Hey, we just... We can't look like we don't know what we're doing here." So I asked them to just appear and have a strong perspective.
Then they're doing that. Then the bigger thing from him is just making sure that all of the blue-green is working correctly. There were some two-laners he had to move out of the new stack that we created into the original stack.
So those are the two actionable items for him. The next upcoming bit of work for him is actually around... So for my intention was to have him own this function here. This function is just very similar to what Lance is working on.
Maybe actually Lance could take this, but the idea here is just it's a very simple object that is for when AA renewal for membership happens, and it's a simple object to hydrate based on information coming out of...
Honestly, that may just be... Lands depending on if it gets to it or I'll just let those put those things together and advance please. This today or tomorrow as soon as possible I think every hour.
Right. So whatever response is available. So let's get back on today and we push our Gemini. All right, so that's there, you can focus on the environments on the left hand side. I really want to get this SPS and DP working.
So sorry, there's nothing broken here, it's just a matter of confirming that the events are coming over and that we're seeing the dashboard on the alerts. It works, it's just a way to confirm it.
So the plan, that's exactly the question. How are we and... There's a ticket for... No, I need a plan for how to confirm this. This is the other ticket. So tickets to make decisions is a bit of a problem.
It's not really a spike related to that unannounced delay, right? It's... So we need to hammer that out there and so bring that up, please. So they need to question... The other thing that is on Antonio's radar is around the BI specific needs.
So he's already done the data model, he's done some projections and that may actually give us much of what we're looking for but we just got from... We had a meeting with them on Friday. We had a good first conversation, good rough direction of what they need us to actually do.
So here's what their targets are like phase one, day one insights that they need to have daily number of members, blah, cancelations. So we basically just need to make sure we have a projection that represents some of the core D1 DS that they have. So, Rinor, today please set me up a session to pay with Antonio because I want to talk about the PI.
Everybody's saying we don't want PI and normal operations to be separate databases. I think that's not a correct decision. So, I talked to Antonio about it today. Okay, they actually owe us KPIs and stuff that they actually... A more detailed explanation of like... Level what they need.
So, I'll follow up with Christian today to get that for us. But this is what they've provided to us as a direction. The third historical data integration. They agree that this is not critical for day one, they really just looking for day one. Then we say that the currently the team has decided that they would have a separate databases for BI and for consumer facings.
I don't think that's a good idea. Only a times telling about it, I don't... We're here today to make sure that before he gets into the... That we can...
So, I think that's it. So, no, it's not... We high level this ask tick number 08:24 from the endor board. The ask is just take the events, hydrate a specific scheme up, push it up object and push it on an event grid, which we agree that we think that's for Lance and you want to pair with him on a couple things, so I'll just have to be a part of that. Me how is taking on a feature?
So, he's actually taking on two smaller features that we need to complete as part of this as well. Why is that not showing up? What is...? It's a planning board. I'm not sure speaking or... Is there...? Is there no internal meeting anymore? No, but this is not correct.
He's working on a couple things. He's got a chat functionality and he's joining product active saying to work on tracking. Working on tracking as well. We please eight am my time tomorrow and Wednesday. Let's just set up two internal fifteen minutes of particular activs for the team.
If you can't be there, that's why I'll be able with the CL want for check in with them. I really want to this week. That's my aim. So I've told the team has been working towards getting this done by end of day Wednesday.
That's like the target for us to be bulletproof on that. And that's I've com I'll just tell you like what's happening, right? When I was talking day, he said to me like, you know, he's not two things one like Bay the one one that day. The first one was that the Webbbs and everything like that was it that was just almost the count of the head that broke the camel's back talking off the head alleged by saying we're going to get that money today and I'm gathering them with that.
Second thing is, he's saying, well, you know, he's not seeing the acceleration from the Soviet team that he would otherwise keep each implement each his own people. So basically that would mean that immediately our times that like would be out of this gate by within you know within Q2 this year Q2 Q3.
But that would be definitely disastrous. So like the issue here is that he now is just looking at what harm am I getting from Solvio? Are they the accelerated T? And I need to make some like immediate changes for that.
And that's why we need to start showing this much more a segerated approach. So I need to work with the team, but I need to get like it's my job to do that. So that's why I'm getting involved this week, next week, whatever weeks I have to until I can feel that our team's genuinely faster than them by two, three times.
So that's why I want to have these sessions. This is super important. That's a huge G for the company. If it goes down, it is genuinely disastrous. I guess it as a prop as a company. So I really want to pay attention to that. What I need your help with is helping me find the opportunities to help the team to accelerate.
If we do, we think France and Germany are pulling that. Do you think that they're driving? I think they're pulling their weight, definitely. I don't think they're speeding up the team, but they're... If I were to say someone who's pushing faster, I'd give that to you, Elvis. I don't view... If I ever think about if he is an advocate or... He's more... He's on our team, but he is definitely not a team player. He's running his own agenda very clearly.
That's what I mean coming into... So that's the point. He basically... Stace is already planning this. I know how Stace works. He's putting the... As in to take over. If he sees that this is not going the right way, he's flipping the switch.
He literally almost flipped the switch on Friday. That was the end of our tenure here, right? So that's why I'm worried. I get... Come in to take over the... We can be much faster and we can take better decisions than the others.
So this is really now my time. I need to be on this gig as a top priority. Whereas there is a task that I need to do as well, I will do it. So is there anything that I can... Anything not started on me yet? Hasn't been started... Everything is... This right here is a bit of a black spot. This right here is... We need a...
I spoke to Antonio about this morning and he is... I don't know what this is. So this is a black spot. This is an unknown for us right now. I need to then migrate. I'd like one to look at is just the results... Where you worried about the results processing?
He says to me, "Why does this book change every time? Like something happens every time somebody changes the system. Suddenly, the results change in applications, and you're pissed about that.
So that's one thing I don't know. So results processing, please tick it for me for saying results, data discrepancies, and stability. Just assign that in the investigation just to sign that to me.
I'm going to put various people to try to figure out what's going on there, and I'll probably rewrite the whole thing in its results processing results.
Me, sir. I hope you caught the more. Let's go and... Please, before my call with this, which is in one hour from now, please make sure that the diagram is TED up as we... As you mentioned, yes, three steps.
I'll update. No big deal. Have you had a chance to take a look at what Antonio created? His story is pretty compelling around what he's able to knock off for this Stripe here. They don't get it.
I've spoken to him. I just checked him again, and I said to him, "Is this what I'm going to show?" He said, "Yes." So I'm just going to send him a message. I asked him to come prepared to not speak from Postman.
Your reports look really good in Postman, but Stacey being an intellectual being an engineer should be able to show him the Aurora database, show him the graph code. That was my one direction to him relative to what he shared, said Tuesday morning. The environment has referred you to books from PayPal into, and that's what he wants to see. One question for you. In one of our conversations, we talked about how we're solving the inline projections. The idea that they should be slowly migrated over to the entity model, that is a bit of a blackspot as well, because we're not clear right now. We don't need to do that. All the new projections or the new orders that exist in this layer, should we be as part of... Whenever we touch anything, be updating them to use the new data model. What is our plan of attack for the existing projections?
Well, we need to... As we touch them, we basically migrate them. But right now, anything that touches any existing part of the old current system needs to be touched and migrated over. Unless it's too big of an issue, right?
But that's how we're going to move quickly. We're not going to meet my way of anyone immediately. Then when we have something like a new query or up to a query or somebody working something for BI or something that needs some policy that needs work that was previously on the previous connectors, we just need to make sure that all of those are now being migrated to... Well, yeah, we... This is as needed... This is the core work right now just to get to...
The other question I had was what's our expected consumer of this new data model? Like the customer portal. Is that correct? Is it really more the BI effort is the first consumer projections?
Yeah. So basically, it's all about consuming now. Everything's about the consumer. The customer always has the data just because of getting a hand. But the consumer will function so functionally always takes over to make... I don't disagree.
I think my question to you and to Antonio is just this line here, these two elements. We're built some new stuff. Great. Who is the consumer of that new stuff? Is this just the plan down the line, or is it something we need to be working on when that happens? If somebody gets an order for him...
And you can't stand this. If somebody makes an order and that order... They sign into an account after I presumed, then I expect them to be able to see the status of their work. Something like... Agreed that the API lives for that, but does the command the UI currently point to that?
Yeah, that's my question. Is there a plan in the current UI that after a customer orders something, they can see their order? So the way that I understand that's supposed to be working right now is via Krisp.
So it basically... By getting them into the Krisp database, is what we're servicing the customer service needs or any other downstream needs. The next phase... Okay, so the individuals... Correct, they can only... Whatever they can see basically through Krisp is all they have access to right now. Just want to make sure to see it in Krisp. I don't disagree.
But the question... They'd have to log into the main site. Their results, they wouldn't see their order. I don't know. I don't have enough information to be clear on to be 100% on that, but this is a gap that I'm seeing and obviously it's a concern.
It's a fish and feel of what needs to actually happen and we'll make sure it happens. But ideally, we would be making some kind of query but beforeful into the graph to get the data for them. That's ideal.
If it doesn't have it, then we'll be ready for it. So... Like those are pissing to write the GI and it's just people who have UI. I think the infrastructure being there with the projection exactly.
Okay. Cool. So no blind spot there then. This is... We already spoke about that, this is an ongoing conversation we're having, but they're simple, they're just projections and that is... That's it. No worries. I see it, Mike.
Okay, I need to get these all worked out.

