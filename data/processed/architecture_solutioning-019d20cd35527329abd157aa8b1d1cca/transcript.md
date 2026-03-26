# Architecture Solutioning - Mar, 24

# Transcript
**Jennifer | 00:07**
Hey. Wes. Thanks for shar. Carrying the mer off.

**Wesley Donaldson | 00:11**
No worries. After... Know...
Is not good language.

**Jennifer | 00:38**
They folks.

**Sam Hatoum | 00:39**
My apologies. I just got to take care of one thing real quick. I've got somebody at the door, but I'll be right back.

**Wesley Donaldson | 00:51**
4.

**Sam Hatoum | 01:36**
Hey, my apologies, I'm back.

**Jennifer | 01:43**
Okay, so today it looks like we were going to revisit the mirror board that we put all of the risk items on. Sam, did you have a specific way that you wanted to review that?

**Sam Hatoum | 01:57**
Or do we just want to over. Yeah. Let's look at the top corner like the you know, the high at the high impact high likelihood and then see what we mitigations we can come up with and what we need to then close as part of the worker.

**Jennifer | 02:15**
If I can share, let me make sure... You know what? I probably am not recording this one yet because it is not the normal one. Let me...

**Sam Hatoum | 02:28**
Get this recording.

**Stace | 02:32**
Before we pivot into this. Maybe you guys already worked through this yesterday as a team, which would be great. But for Dane, Harry, and Antonio, you all are 100% aligned up to speed. Everyone knows...
Kind of the revised ET pattern, like Sam was saying, that's real architecture, right? Should we be discussing that first, or is that done?

**Sam Hatoum | 02:58**
So, Antonio, I think the people that are not privy to it fully are Harry and Dane. So if you want me to take five minutes to go through the changes...

**Stace | 03:09**
Yeah, I think that's more important. Actually, what this meeting should be for... We can get into that in the next chart a little bit, but I'm going to send out some governance on this meeting. I do really want this to be an architectural review board because I think sometimes we use it as another planning session.

**Sam Hatoum | 03:31**
Like requirements gathering and stuff like that. Okay, so no problem. I'd be happy to go through that with you. Alright, so basically we have made a couple of realizations and therefore some changes in the cycle that I think will improve things tremendously.
So the first thing is when we look at the data coming in from Recurly to the API gateway to the webhook to SQS before it gets to our hydration, this is basically all the Recurly ingestion.
So I don't know if this is actually going to be real or not as a package, but this is all just part of... We need to get data from Recurly to us in a secure way. So in a stable way. That's why we have our queue.
If this doesn't respond well, this will go back to Recurly, which says Knack and then Recurly has its own buffer of resenting stuff. But if it comes to us and it gets into our queue, we've taken the handshake with Recurly. We've said this is now in our domain. Thank you very much. We can take care of it from here and we have our DLQ to protect us if there's stuff that's going on, and we can have notifications and so on.
It's a good pattern. Nothing crazy here, right? It's just a case of the boundary. The thing that came out of the session yesterday was that the boundary and the deployment boundary would be just a single package. We might call it a recurring ingestion.
It has its own infrastructure like CD infrastructure as code. Infrastructure as code like it has that built in with the CDKA hold of scripts. All right, so that's that part. Clear, right? Anyone got any questions on this?

**Speaker 5 | 05:07**
Makes sense so far.

**Sam Hatoum | 05:08**
Yeah, so good. So then we get into a new change here, which is we're creating a new package called core log. Let's call that core logic and inter-core logic. Where before it was a single Lambda that was doing hydrate a CL Lambda, this is actually all just one big Lambda right now.
And a single process that is the key right there. It's actually a single process that runs this, separate out from... It just so happens to be... Okay, so the key insight here is that a single process is going to make it easier for everyone to reason about. Whereas before we had a connector that then once something happens in current, we fire off connectors. We have to configure connectors which then fire off an event into a Lambda. That Lambda would then have to take care of any compensation.
So the happy part, yes, it can send something down, but compensation is where the problems are and when it has to compensate, how does it compensate? Does it send it back to it? Does it send it to a queue if so, is it sending it back to the park events in current and do we have alerts and things like that on those?
It's just a lot to a distributed system. So the solution is not to distribute less. Recently we've been doing work around Emmett, which actually has quite a lot of these nice things built into it, like the reactors.
It says, "Okay, why don't we leverage the reactors?" So we thought, "Okay, and this all started by me having a conversation with Lance." Excuse my accent, that's Lance in your language. But if we... When I was having a discussion with Lance over here about this CSTAR connector, that's where I started to see the complications.
"Okay, well, do we compensate here? Do we compensate when we come back from here?" So it drove the conversation towards having a single process where when the events come in from SQS and they get hydrated. Now we have reactors, right?
So one of our reactors goes and updates the read models, for example, somebody just asked a question. Was that...?

**Speaker 5 | 07:17**
No, but I was about to line up. What are you lining up right now?

**Sam Hatoum | 07:21**
Okay, cool, yeah, it's... You've got... Circad problems like me. Things should be even. Yeah, I'll get them there. So... Okay, so we've got Hydrate ACL over here, which runs, and then as a reaction, we do projectors.
So that's why I've called it... This is a reactor over here. Then it updates read of, and that's one reactor. We have another reactor over here. You have a reactor on. Okay, so that's another reactor which simply says, "Okay, when an event is placed, send it over."
This one here says, "When any event update remodels, which goes ahead and updates the remodels over in Aurora, right?" So that's what these are. I have it just for you and just for you almost. What, and then this one is the same thing, right?
It's a reactor. So we have two reactors over here that react to events coming in, and Emmett is going to be very good at managing this, right? It's got an internal state machine. It has the concept of durable workflows, which we can get into later.
So this is a great way to do compensation. Durable workflows emit. If you're interested, you can go look at his post about it over here. I'll share anyway, I really recommend that anyone who's interested in all of this read everything that Oscar has ever said about anything. It would enlighten you big time.
Okay, so back to it. Basically, this is simplified architecture infrastructure. We have fewer moving parts. We have just one lander that basically has the core logic. Inside here, we can separate core logic by, let's say, orders over here, and then other domains in...
If we find that we need to split this later, we can split this into a separate process, which feeds off it separately. Like, it's easy to scale, but for the beginning, let's just start with a single process
and expand it when we need to. We have a pattern for separate domains that can all live within that. Now we have basically integration reactors and projection reactors. Over here, everything's just a reactor, and that's it, really, that's the simplification.
So one more thing here is these reactors. So I'll pause for a second just to see if there are any questions on this boundary here.

**Speaker 5 | 09:46**
As well, specifically on reactors. This is an EMA thing.

**Sam Hatoum | 09:50**
Yes. I mean, it's basically like the concept is within event sourcing. Really? If I just look at the CR pattern here from...

**Speaker 5 | 10:00**
Is it like a HubSpot thing where the reactor is subscribed, and then it reacts?

**Antônio Falcão Jr | 10:05**
It's... I'm in dispatch, it's in process dispatch. Sorry, Sam.

**Sam Hatoum | 10:09**
No, go ahead, please do. So you think it's...

**Antônio Falcão Jr | 10:14**
It is quite simple, yeah, it's in process event dispatching, so we have everything running the same process. This is Sam's goal to keep this interpretation consistent. Once we can take advantage of this in-process mechanism to understand if we succeeded by integrating or not,
we can push that message to a dead letter and then...

**Sam Hatoum | 10:39**
Keep it moving. Yeah, I had to think some of it, but very simply, exactly what you just said, but what Antonio said, event sourcing is three patterns. Really, that's it. Decide, evolve, react. That's all we need. That's the currency. In fact, they're right. Decide, evolve, react. That's it. That's the pattern. Different is great. What's that?

**Speaker 5 | 11:07**
The dur pattern?

**Sam Hatoum | 11:09**
Yeah, exactly, the dur. I think I once called it tar try apply it, and I'll if you're interested, I'll send it, but like, basically that's it. And Rinor is built on these concepts. So if I go to these concepts like React, this one here is... We actually have a decider somewhere in between here. We're supposed not to show it right now like decisions would be here, right? They decide whether an event can happen or not. Let me do this. Decisions happen here, reactions happen here. Effectively copy these. We decide over here to say whether an event is allowed to happen or not. We evolve over here, which is basically putting the data into databases and will react over here to say when then and get side effects.
That's it, that's what works. Cool.

**Speaker 5 | 12:05**
There's an article about how...

**Sam Hatoum | 12:05**
To do it in Ruby. There you go. I think co-coding this is it. Honestly, it's mandatory. Everyone on this call, I mandate that you read this article here and really understand. If you have any questions, please come back to me.
This is the absolute essence of what we've got here. This is the core of our architecture. This is mandatory. This is how the decider pattern works, and this is the state machine that actually acts.
It's a beautiful pattern. Once you get this, it's a reducer pattern. Have a look at it, ask me any questions, and that's basically everything we're doing here is based on that. Cool.
Okay, so this is it, a single process where it happens. We don't longer have connectors, we don't have park events, we don't have any of that stuff. Any problems that happen incoming will be caught in this SQS. Any problems that happen outgoing...
Well, for us talking to Azure Event Grid, maybe they're doing a restart, maybe that system is down. We want to guarantee that our system works. So our reactors will put a message on SQS and we will own this too, which we're calling on the packages. Event bridge job dispatcher, let's say.
It has its own package with its own deployment boundary. What? I mean here. Like every one of these... Here. Every these brownish boxes is a deployment boundary. So this... Each one has its own infrastructure code scripts. It's the idea that's why I've drawn them out like this in terms of the different boundaries.
The purpose of this is just to make sure that in our system, we can fire and forget. So we say we've reacted, we've put this job on here, our job is done. Now, the problems over here... We have a D LQ that can alert us and let us know if there's any problems before it goes to a...
All right. This job is done. It's moved to here.

**Yoelvis | 13:56**
Any questions? So something I've been suggesting is the idea of having the separation of a logical separation in different folders but creating different packages, different stocks... Adding a lot of operational overhead that I believe for this a very simple approach that we are following is better just to have everything in one single package and we can split logically by folders because for example, the first one is just one LLaMA win with 1sqs is incredible. Simple.
But adding the stock and adding a package is just making us create a separation that is not necessarily what we need for the first iteration. I would say...

**Sam Hatoum | 14:52**
You're suggesting that these different stacks here, we combine them into a single stack.

**Yoelvis | 15:01**
Yeah, we can always evolve this and separate it, but it's usually a good default just to start with everything integrated, and then if we see a use case for separation, we can do it. It's mostly what AWS recommends for the stacks, but I feel like we are carrying stacks for very thin Slack stacks.
For example, the recording ingestion is basically one LLaMA most of the stack. So it's probably just could be a folder within the recording stock or package you're saying.

**Stace | 15:46**
But I can counter that with... From a cloud architecture standpoint, I could be looking at it from a developer experience and a local developer. Like simplifying and having more monolithic applications is easier, but from an enterprise scale and cloud deployment thing, right? You really do want separations of concerns.
The ideal LLaMA does a couple of lines of code, it just does one thing right, and you have hundreds of them.

**Yoelvis | 16:15**
Yeah, but we can't have that. But with one stack, it's not just...

**Sam Hatoum | 16:23**
Saying you're saying it's just... Understand what you're saying. It's like you're saying keep the LLaMA as independent, but have a single Uber stack.

**Yoelvis | 16:32**
Yeah. What I say is we can have one CDK stack to package and deploy all these components, and we can separate them logically in separate folds or whatever we want. But it's easier to maintain, I guess, in the future. This growth, I don't think this is going to grow too much, but if we can separate, we can always separate.
But it would be easier just to the overall understanding processing just to colocate all the different pieces that are related into one stack.

**Sam Hatoum | 17:12**
I think there's always room for refactoring as we learn, whether we need to consolidate or distribute. I think that's a very good constant question to ask. So agree with the challenge. I would push back a little bit on something based on some experience I've had with stacks, which is sometimes a stack just freaks out and there's no recovering it. Have you seen that before?

**Yoelvis | 17:36**
Yeah, yes, and workarounds and things like that. But in my experience in the continuous iteration processes, we are trying to do all or nothing most of the time. It's weird for me to see us maintaining one stack when other stacks are down.
It's usually we deploy everything at once. It's not like we don't have that kind of...

**Sam Hatoum | 18:02**
Is that true though? Like, sorry, I don't think that because we do have a differential deployer. It doesn't deploy everything at once. It actually looks at what's changed and it only deploys that part now that could still go to a stack.
Cloud Formations does support individual resource updates. So it's not an all or nothing, even if you have a single stack. I mean, it's a good challenge. I think it's worth looking at.
Yeah, I like to make a recommendation and have a look at it. I'm down for something that simplifies. If we think it simplifies it.

**Yoelvis | 18:35**
Yeah, possible. Here I noticed the recorder webhook is just passing the API gateway value into the queue. We can completely escape that one. We can use the API gateway integration with SQS and API gateway is going to send the events directly to SQS.

**Sam Hatoum | 18:55**
Yeah, nice spot, definitely fewer parts, definitely better.

**Stace | 19:00**
Well, I think this is a perfect discussion for this type of meeting, right? Because it is an ongoing architecture pattern discussion. Yeah, I like the challenge, too. Again, I might be thinking ahead, but I do like the isolation of risk by having at least controlling stacks by domain or function within the business. Does that make sense?
I don't want to redeploy something every time if we don't have to. Just because you take the risk of introducing disruptions to the business.

**Yoelvis | 19:47**
Yeah. No. My main concern is, like.

**Stace | 19:51**
This one's an interesting topic because I might say in the box they're the left. We've got packages, recurring ingestion, and maybe even putting into current like that could all be one stack.

**Sam Hatoum | 20:17**
Is that sorry.

**Stace | 20:18**
But I wouldn't necessarily... I might question if that's the same domain like does that deploy when we deploy the e-commerce store or the call center portal? I'd say no, right? This is the infrastructure that powers... It's not the application, right? Once this is up and running, it's highly unlikely to change where our interfaces and the lab that would power those interfaces in the graph are much more volatile, and those will change every day with small releases.
So I like... Do we really want to keep redeploying all the webhooks and all the current stuff?

**Sam Hatoum | 20:59**
We do that right now.

**Stace | 21:02**
I don't know, I'm just kind of throwing it out there as we consolidate, right? That there are advantages to keeping some things.

**Yoelvis | 21:08**
But my main concern, right?

**Stace | 21:11**
I don't want a small change to the store to bring down the recurring connectors. [Laughter].

**Yoelvis | 21:16**
No, my main concern with this is... I see this... Imagine in the future, for every new feature we are trying to create, three, four different stocks, we are going to have 1000 packages. 1000 stocks?
Yeah, it's like this is a very simple feature for me. It's just ingestion processing and then send it to the other consumers. But it's a domain that is relatively simple. It's not like... It's not going to change a lot, but I see...
Sometimes there is value in separating, but in other cases it's like being... Is overkill. Even for developing in the day-to-day, just you have to deal with three, four different packages folders, bills, and scripts.
Sometimes you need something that is common between two different packages. Then you need to create a shared package just to share some stuff between all of them. I prefer to avoid the premature optimizations and rather than... I prefer just to solve the problem in a simple way and then we... If we happen to have an issue, we can always evolve.
But anyways, that's my point of view on this. But I am okay if you are liking the three separate packages and stacks.

**Sam Hatoum | 22:57**
I'm thinking about where... I think what would make sense is to go ahead and say this is a deployment if we look at it as boundaries, right? There's the monorepo locally where you run your packages,
and I should be able to deploy them or simply by doing "node start" I just go to my top level and I say "PM start". It just goes into everywhere and starts everything up, right? Great.
But then that's my local deployment boundary, it's deploying into just... It's actually just lots of different node processes. When it goes to the cloud, there's a different deployment profile and different deployment boundaries.
I think the fact that we have everything as infrastructure as code already means that this is malleable. This is... You can change it if you actually want to change it right now. You can go in there and you can redefine that boundary, and the system will still work.
Especially if you do it on a green leg when the blue one's up and we switch it around that way again, we have protection to help us go through these refactors. I guess the simple question is, do we think as a team here that if we were to consolidate some things, it would improve? What would the improvement be?
If it's a massive improvement for a low amount of effort, there's obviously no brainer. If it's a massive effort for a low amount of improvement, then maybe we punt it. So I think I would just put that frame around it like, "What exactly do we get here from?
What are we going to consolidate first? How much effort is it to consolidate and how much value do we get from that?"

**Wesley Donaldson | 24:28**
Come down.

**Sam Hatoum | 24:28**
I know you have a gut feel for that right now. Yours, which I'm in agreement
with. I think there's a worthy challenge. How would you...? If you were to express it in those terms, do you think you have enough information right now to express it? Or would you need to do some work to figure that out?

**Wesley Donaldson | 24:43**
Told. A good choice.

**Yoelvis | 24:45**
I can't express it. Yeah, but...

**Sam Hatoum | 24:47**
Yeah, well...

**Yoelvis | 24:48**
Yes, let me...

**Sam Hatoum | 24:48**
Ask you, do we think about it?

**Yoelvis | 24:51**
Let me just write something here exactly.

**Sam Hatoum | 24:53**
Exactly. If it's like I say, if it's a then it becomes a prioritization, it's like, "Okay, we have something that will give us a high value for low effort."

**Wesley Donaldson | 25:00**
Good.

**Sam Hatoum | 25:01**
We can do it tomorrow. Well, let's schedule it.

**Yoelvis | 25:06**
Yeah, it's absolutely simple. Whatever we want to do, it's not like a big issue, especially with this super simple. We will only need to remove a lot of code in order to consolidate the stacks. But I can't give you my insights. I see the value in the separation. Different domains, different trade-offs, different error handling, and deployment issues that could happen.
So yeah, we can see that there are...

**Stace | 25:42**
Ongoing discussions. I guess I'm okay because you brought this up in the beginning too, right? For this point in the iteration, I think that's a very fair point, right? Can we start simple and plan in the code? What's an easy way to break it apart if and when we need to?

**Yoelvis | 26:04**
Yeah, and I would say an Antonio can confirm as well. It's going to be super simple just to consolidate if we want to do that.

**Antônio Falcão Jr | 26:18**
Yeah, I agree.

**Sam Hatoum | 26:23**
Alright, bring back some... Bring back that kind of information like effort, super simple, great value is what... Then we can schedule it if it makes sense. Like, I'll bring it in. I think that's all that we need. Cool.
So does this make sense? Any other questions on the changes and the connectors going to go away? So one thing here, one other thing to mention, the orders, results, participants, etc., all of that stuff that goes in a database today. Today that powers BI, so if we just look over here with our BI reporting needs, this is actually good.
I know that it's seen here as this isn't a good spot. This is green. Correct me if I'm wrong, Stas, but we do have BI already consuming data from the database. Is that a correct statement?
Okay, so that's green, right? That's just BI reporting today. Maybe we can iterate, but it's green and it's in production now. There are new needs. I know that we can talk about those. So BI comes from there now.

**Stace | 27:29**
Actually, we stopped on BI real quick because I know this is an ongoing discussion, and Wes is driving this. I think here's another area where we've got that participant. Gotcha. Again, I don't know the right answer, and I'm just thinking out loud. Is when we give them a table for orders and participants, should it be mixed with the schema they're already polling for their current results reports? Or should it be separate?
I'm thinking, at least, think about maybe that it's separate because again, you're going to have to balance two different sources of participants here.

**Sam Hatoum | 28:09**
And can you help me understand that? Like when you sorry, this is when we start doing the very like the Shopify versus Recy participant sort of stuff, is that what you mean?

**Stace | 28:17**
Well, today, right? And everything that's on this that we just talked about for screen. So you're going to have for the first time ever and thrive because Shop Fight doesn't even do this. So with recurly when you get that order from the web, we're creating a participant in the current essentially for the first time and Thrive. Thrive is consuming and creating participants from CSTAR, but for every participant we create directly as a first-party participant in Thrive, and you're going to see that same participant come back from CSTAR as a reflection.
So you're going to get all of those twice. So you're going to have a clean stream and a dirty stream, and I want to make sure that in the meantime, as we strangle that dirty CSTAR stream out, that BI can tell the difference.

**Sam Hatoum | 29:14**
So I think, you know, my fingers always, for some reason put C stopped. I don't know if I'm CG but anyway, so we got, you know, the clean recurdy, I guess is the one recuring orders.

**Stace | 29:31**
Then there's only going to be a subset at the beginning, right? It's only going to be a tiny amount. So we can't trust it yet, but we don't want to pollute it with the bad stuff coming from CSTAR either.

**Sam Hatoum | 29:41**
Right? These are the facts coming in, right? We like to decide here we have these and business rules, and then over here, the events are basically the facts that get in. Okay, great.
So let me just move this over, and we know that these have come in before the projections. But yeah, on this side, I'll type this up. So the fact is they happened. That's great. Now we have our update models, reactor, and now over here we have a data modeling concern.
So the data modeling is like, "How do we want to create a data model in here that suits the need?" And so then we get into if I'll just do some code over here, code block of what that might look like.
Now we might say, "Okay, well, the data model for that, I just put it as an object model rather than a CCD than a table. But let's just say, like, you know, we have one order and then we have, you know, sources. Let's say. I don't know if this is the right answer, but my point is that we can say, you know, CTAR and then recur. I don't know if that's a duplicate, like how we might say duplicate or we might say, you know, is duplicate true, false?
So that's what I'm trying to say, like, I think it's a D yeah, the they have that.

**Stace | 30:51**
My question is though, are they actually two separate streams at the moment?

**Sam Hatoum | 30:58**
They would be two separate streams in the database.

**Stace | 31:00**
Yeah, because one would be... We're just storing the CTAR data model with CTAR product codes and CTAR participant field names and all that kind of stuff. Which will hopefully be different than what we're taking from recurly, which is largely recurly shape.

**Sam Hatoum | 31:19**
Yeah. So all our streams are something like this. They're going to have a stream prefix and then followed by some ID so the ones that are going to come here are going to have a prefix and some ID now the event format itself, within the data. Ideally, we'd have a PD in here and we'd have the same PD in here potentially.
We need some way to tie them up later. So as long as the information ties them up, then we can replay them and get what we need. Is that true? Will we have a paid on both sides? I assume.

**Speaker 8 | 31:48**
On Cesar for sure. Recurly I don't think so. Right. Recurly you have a completely different notion of...

**Stace | 31:57**
An account... They're both picks, right? When we're going to want the one created in a curly to be the participant GUID for that participant, right? That will be the unique identifier that we will follow that person around with.

**Wesley Donaldson | 32:14**
All product.

**Stace | 32:16**
Not one generated by CTAR.

**Sam Hatoum | 32:20**
But you know, we might end up with something like this. I don't know the exact answer right now, but if you imagine there's an account-associated event, where it takes the order ID and then maps it to a PI ID at that point, that could happen as a separate step later. If the orders come in right now and you're saying, "We don't have a PI ID," but there's some reconciliation process...

**Stace | 32:40**
Well, there will be an account-associated, but that's going to have to be a fulfillment service. We're going to have to build as part of the call center project.

**Sam Hatoum | 32:47**
So, is it what you know, whichever those are the kind of...?

**Stace | 32:50**
Because there are a couple of things that need to happen there, right? It's not necessarily just order ID to participant ID if you're going to have a one-dimensional relationship to orders, that could be a mini-to-one relationship with screenings, that will be a mini-to-one relationship with the participant.

**Sam Hatoum | 33:13**
Yeah. I mean, wherever that relationship happens, we need to record that fact.

**Stace | 33:17**
So, let's not work it all out now. But what I'm saying is, do not mix the streams like Ghostbusters, right? So reporting will report on the participant for results, and they should be looking at the recurring participant if they're attempting to report on sales.
It's not how we want to keep it forever, but I think it's how it needs to be to start.

**Sam Hatoum | 33:42**
All right, so I'll just put this in here. But as long as we get the facts coming in here and we can discriminate on the facts, then the second thing we do is for the BI and others, the data model that we have, we evolve accordingly.
If we get this completely wrong, by the way, and we're like, "Actually, we made some major problems. We've got some major problems with our modeling." We can literally just zap this like actually delete it on... As scary. You actually delete it and you can run this again and then we'll get the reprojection and we'll have the remodeled data. As long as we record the facts, that's all that matters.
They have all the information we need. All right, so what else do we...? So much for my five minutes of going over this architecture, but any other questions?
One model to rule them all. All right. So that's why we want one model here so that these kinds of... Exactly this kind of problem here. If we've modeled this once for BI, it should be the same model that we use for consumers who come to do orders. You to look at that in the customer portal. Same with the future FSA app. Same with the future call center.
Anything we do that's going to be looking at data, we should have one data model. Very much like a traditional app, you have one data model. The only difference is that, instead of recording states straight into that model, we're instead just going through the sevening system because it gives us all these extra benefits.
That's it. But I wanted to highlight one database for all needs rather than separate databases because if we have separate databases, we can have a divergence between them. I think it'll be pretty annoying to have business intelligence seeing one thing and then customers seeing something slightly different because somebody didn't update it in both places.

**Yoelvis | 35:40**
Yeah, absolutely. We can always use the rig replicas and connect the BI to a rig replica so it's not affecting the main users.

**Sam Hatoum | 35:51**
Now one extra thing. We should plan when we do want to do this. There is actually within current... Let me guess. There is actually within current there is another feature that they have which is basically a secondary index, right?
That actually gives you a doc deb access to it. So if I would show you here, to do DPSQL it's in their new version. There it is. I think this is Steven I was speaking to the other day. Read more about it. I guess it's here.
That's it. There are queries, right? So now, and this is something Stacey has been wanting since the get-go, which is you can just do things like this. Select star from stream orders where a data. Blah.
There's a secondary index now that allows you to query the events directly for their data with things like good by, etc., all of that kind of stuff. Which is awesome, because now if we basically use the secondary, this database here, BI can actually get quite a lot of what they need without requiring us to build them any kind of projection.
I have to make that red because it's not done yet. But that's a future state and let's get into a box because we haven't got it yet since it's in a new version of the current that we need to do that. Any questions on that one?

**Yoelvis | 37:17**
Sorry, what's the secondary index advantage?

**Sam Hatoum | 37:22**
Yeah, I'll just put this in here. So with the Events store, it's raw events. You can't really get anything out of the events unless you make a projection. All right, so far, in order to feed the BI, we've had to create a bunch of projections for them, which is where we have our red model BI L for that pushes in a bunch of data into this order based on the events. It projects the events and evolves them into a red model, and BI consumes it from here. What this enables us to do because it's got secondary indexes which enable SQL...
I just called this SQL what it is. SQL interface directly into the event store, which was never possible before. It's based on secondary indexes in... Under the hood, right? And so now what that means is BI instead of coming in through Reed models and requiring effort to create remodels to update what they want, they can just talk directly to the SQL interface and get the data from the events into structured data.

**Wesley Donaldson | 38:19**
The... of the world.

**Sam Hatoum | 38:26**
Does that make sense?
Sorry, I didn't see... Did you react?

**Yoelvis | 38:36**
I'm not sure. I'm not sure. I follow, but it's like structured data, but we can get from the. But what's the difference between the secondary index out on regular current well.

**Sam Hatoum | 38:52**
Current regular by itself, right? It's just events. If I go to current right now, all I'll see is event streams. All I can say is stream from here to here or from there. I can just say from this point in time go backwards, go forwards.
But give me a stream of events. I can't say select star from order from you know this stream where order is greater than $10. I can't... I have to write a function to do that myself, right? And that's what projectors are.
Yeah, but we have remodel connectors which basically do the remodels BI projections over here. So in here is where we basically do the projections, and those projections go into a SQL database. Now we can skip this step for a lot of the things that BI needs by just giving them direct SQL access using this new interface. Now they can have much more data available to them, and they can run queries directly against the Reed replica of current without having to come to the dev team and say, "Can you build me a projection, please?"

**Yoelvis | 39:47**
Yeah, I was. I was kind of confused by the name secondary index instead of or no index.

**Sam Hatoum | 39:54**
Well, it's secondary index. We read about it in here. You'll see why it's called the second they even mentioned secondary indexes here. Yeah, second secondary indexes.

**Yoelvis | 40:01**
There we go. Right, it's a concept. Okay, it's okay. I want to ask you something. I know I was reading the Mat documentation. I think it's a great library, is making event sourcing more maintainable in my opinion in what I see but they are suggesting using post-res. They say just use post-res.
But we are using current so what's your take on that? I see what you said in your last meeting about core. I got some of the ideas but I just want to reiterate on that to see...

**Sam Hatoum | 40:47**
I guess the value...

**Yoelvis | 40:48**
Rather than using those positive approaches, they chose... Yes, and they have the integration with post-res and everything.

**Sam Hatoum | 40:55**
This one, you get to see my face because this is an important question. So let me again...

**Stace | 41:01**
Off camera to this because this is a future topic for me too, especially if we're not using connectors and some other native current stuff.

**Sam Hatoum | 41:10**
So as a current partner, I'm not supposed to say this but as your partner, I'm absolutely going to say this. Right. I think given... Actually, we get more superpowers when we use post-res directly with current with Emmett because it has this concept of inline projections as well.
Inline projections are very powerful because they use something called Pongo, which under the hood is a SQL driver. It is not trivial to use a SQL database as an event tool. It is not a trivial task because of optimistic concurrency and a bunch of other stuff you have to take care of.
It is not easy. You can't just slap events into a database and just assume it will work. It doesn't, and it's full of perils. But as he understands these perils, and he's created the right drivers and abstractions and everything. I actually just paid them a bunch of money to do something for us so it can run on Azure, which is happening now.
Anyway, he's really good. He used to work at Current, and he really understands the stuff. So he's now built something that works entirely on PostgreSQL. What it has is, for example, when you decide to write an event, he has something which does it all in one transaction.
So the event being written leads to the projection being written at the same time, or it doesn't happen. It does it that way, it's an inline projection. It happens at once, which is how traditional systems work. When you have a record, the next time you do a query, it's there.
So it gets rid of eventual consistency, or it doesn't get rid of it. It punts. It basically does it in one transaction. So it creates the delay in there, but it holds the line for you, and it treats the system like a traditional system.
There's a lot of real good smarts in there, and it works well. I think it's worth looking at that. Once we get all of this done, I think we can talk about a migration from all the events from Current into PostgreSQL and then just use it directly with...
Then we have a single deployment. I think it'll be smart to do that. We'll probably still have two separate secrets, one for the events or one for the projections. We still treat them as completely separate databases, I think. Or schemes or something. We can think about it, but, yeah, I think it's worth opening that subject.

**Wesley Donaldson | 43:12**
Or...

**Sam Hatoum | 43:14**
But don't tell Krisp ever said this, okay? Yeah, that's what I...

**Yoelvis | 43:19**
I noticed that when I was reading the documentation. It was looking relatively way simpler just to integrate with both. They have... They're using the JSON B internally and things like that but it was looking so easy with the integration, the built-in integration that they created for Postor EX.
I'm just wondering, how are we doing that if we are not using any of the LLaMA integration? Are we having to hack around or is... We have a good way to use it?

**Sam Hatoum | 43:53**
No. I mean Emmett. If I go to Emmett... Over here. He's got to get a quick to show something here on source packages. I think it's on the core like ESDB is basically current. Antonio, you wrote this but you didn't rename it.
But you made that you gave a poll request here to make it work with current, I guess, but we didn't update this. Interesting thing. Yeah, event store DB is current and you can see MongoDB, Redis, SQL, etc.
It's got lots of different drivers on a JS. So it's just another driver. It's built really well and it's built really well.

**Stace | 44:33**
Postgres modeled in with that single transaction. I suppose this might be too low level, but they're treating the event history schemas and separate than the projected read schema. Is that always getting around like a forever table lock?

**Sam Hatoum | 44:54**
Exactly. He's got ultimately it's he's got a driver underneath called there's Postgres and then there's Dumbo, and he's got a bunch of different ones. But yeah, it's...

**Stace | 45:04**
It's constantly doing into essentially some sort of event source table, right? Which is forever growing. Yeah, but because we're never reading from it doesn't matter.

**Sam Hatoum | 45:15**
Okay? Correct. And then the data gets it projected into a different place. So yeah, that's, I mean, there's pros and cons, right? Like now you know your data your sorry, your data storage and your data sorry, your event store and your read models are combined into one database.
And there's pros and cons to that. Yeah.

**Stace | 45:34**
No, I think it's interesting to look at, and I'm glad you asked that. You have the same thing was on my mind. If I think about it in terms of this business at the moment, if we're still screening in the neighborhood of a million participants a year, it's not massive. We're well within database cluster scaling, and I don't know if we lose out all that much.

**Sam Hatoum | 46:02**
Yeah.

**Stace | 46:03**
With how many you go a month? The way current scales is much more attractive indeed.

**Sam Hatoum | 46:09**
But we're not...

**Stace | 46:10**
You know...

**Sam Hatoum | 46:10**
We're moving away from connectors and going to reactors already right here, right? So reducing that load. Yeah, it's just going to make it easier if you want to do it later. Now what you don't get is the SQL interface.
You won't get that, right? So that's secondary index. Maybe Oscar will build that one day, but you don't get the ability to query the events directly like that, even though it's in post-Cres because it's still just a stream.

**Yoelvis | 46:41**
Yeah, but we don't always use the projection, so that's a B-line.

**Sam Hatoum | 46:47**
What you can do...

**Stace | 46:49**
In a real-time application scenario, why you'd want to query the streams directly, I could see in a read replica you threw Spark on top or an MCP like there. I could see data warehousing and analysis. Why you might want to muck around in the stream, but probably not. I can do this.

**Sam Hatoum | 47:08**
But Postgres does support JSON queries, right? Directly. And so if the events go in as JSON, which they are, yeah, then you can it has sort of you can then create your own indexes if you want. But you do get some of it, is what I'm trying to say. Actually.
Yeah, it's not...

**Stace | 47:24**
No, it's not. I think it's still possible, right? If we really needed a data analysis function, it might not be the fastest thing in the world. But in that scenario, it doesn't need to be exactly...

**Sam Hatoum | 47:32**
That's my point. So yeah, I think it will shave off a cost and operational cost as well as an actual licensing cost for you. So I do think we should go towards that.

**Stace | 47:45**
Yeah, right. And if you even in a managed service... That's exactly what you brought up. We could even out of having reduced overhead and a managed service like Aurora, which isn't the cheapest way to run it, but if I reactor in the licensing costs and support and things like that, it'll more than pay for it.

**Sam Hatoum | 48:05**
And FYI like you know, I know it's a one man show, but like he's available for like support himself. Like if you if you're you know significantly cheaper than current again, guys don't if anyone tells this to current I will come you I will find where you live.
Yeah.

**Yoelvis | 48:22**
Let me ask you something very quick about the event sourcing. If a user is requesting to remove his personal data, how do you approach that in an event sourcing workflow?

**Sam Hatoum | 48:36**
You're bringing all the good questions today, man. Alright, co, there's this concept called crypto shredding, which or cryptorashing, which I like to say has nothing to do with talking shit about crypto people, but, butto no one got that joke.

**Wesley Donaldson | 48:50**
Not...

**Sam Hatoum | 48:52**
No mind, but crypto shredding event sourcing, yes.
So this one... GDPR exactly. So the idea is we're not doing this right now, but anytime you store. And we can go back and modify if we really need to. But anytime you store personal data, what you do is you actually store it as... You encrypt it on the way into the event, and then you have the keys for encryption in a database.
So let's say your account, right? Excuse me. We have a key. We generate a key for you. It's in a data store somewhere, a database, not an event store, a database because we want to be able to wipe it. The keys associated with you. Now, every event we write that has personal information, we encrypt that information into the event using your key, which means the data inside that event is always encrypted. When we play them back, we decrypt it on the way out.
Let's say you come and say, "I want my data wiped. I don't want to... Please wipe all my data." We wipe your key, and it's equivalent to getting rid of your data because it's cryptography. There is no way to get it back because it's been hashed.
So that's the way you get around GDPR with an event-only stream. That's how you can do things like GDPR and so on. It's a bit more tricky in Figma, but that's how you do it.

**Stace | 50:13**
We didn't launch with it, but there's a less clean method, but it's good for this team to reiterate it, right? So we haven't talked about it more, and now we're adding more. Our participant in the pipeline getting orders from recurring... Even in a post-SQL world, right? We want to be careful what this is in a relational model, right? We want to make sure we limit the blast radius, like in a participant record that should always be its own stream, and the only place we should have that name, birthday, email, phone number, anything that would be considered PI. So even in an all-current world and correct me if I'm wrong here. Sam, right. We could scavenge that record but then not lose all the related streams.

**Sam Hatoum | 50:57**
I don't know. I mean, I know there are ways to do that, but it would be a lot easier.

**Wesley Donaldson | 50:57**
No.

**Sam Hatoum | 51:00**
Again, if we eventually move to PostgreSQL, then the events are accessible. It's not like Krisp actually limits you. It says you're not allowed to do this by principle, you're not allowed to do it.
So that you don't shoot yourself in the foot. So it's like a true event store in that case. The other thing we could do is we could, if we really wanted to, you could migrate to stream from one to another like this. For that same participant stream, you can go get that participant stream, migrate it to a new prefix, and in the process do something.
Then you can delete that stream altogether, if that is possible and then scatter it like you said the middle-core so that would be the process if we wanted to do it today. It's not that we don't have an ounce, it's just a bit fiddly.
Yeah, I think if you had all the events in PostgreSQL, technically you could go in and modify them. You shouldn't, but you could. Yeah.
Dane, Harry, Jennifer, any thoughts about the architecture we've spoken about so far? Do you think you want to go?

**Speaker 5 | 52:08**
No, it seems reasonable to move straight to PostgreSQL rather than having it be this like cache layer currently. It's interesting.

**Sam Hatoum | 52:20**
So yeah, I'm both an event store as well as a read model.

**Speaker 8 | 52:24**
I have the idea that crypto sharing is right. We did not implement encryption of the events. Now what does that look like in the future, right? So for the events that are already there, the streams that we already have, we can have to retroactively replace through them, encrypting them or what do we do?

**Sam Hatoum | 52:43**
We basically migrate it from... Let's say the prefix right now is prefix ID and then stream ID would have prefix ID underscore encrypted. Let's say when we do this, we'll actually change all the names of the streams to be like, let's say, put a new prefix that says encrypted, and then we'll start reading from encrypted, and then we'll take the migration effort of going over any stream that was not encrypted in the past to encrypt it.
Then we delete the old streams and scavenge. Now all the streams are encrypted, including the ones we had from before. Then all the new ones will be encrypted. Okay, bit of a... Cancel that work.
Okay, so fingers crossed all this will be green by the end of the week at least. All this line down here from left to right, we've got this working on the integration environment like that line is proven on the integration on the development environment.
So thank you, Antonio, for getting that done. If it's in production and we're ready to roll, what's happening? What's happening with this obvious? I know you're working on getting the data straight out from hydrating the...
When we get the ACL, you're going to put it straight to Postgres. Is this still an active effort? No, okay, can I delete this? You're cool.

**Stace | 54:12**
To return it? Yeah, either delete it or what do you feel should turn it light gray or a dotted line or something?

**Sam Hatoum | 54:20**
I'll make it gray, light gray. How about that? So we don't commit completely to it's our backup. There we go, okay? Then let's just throw this up real quick. We had a bunch of stuff down here about... We've got the orders that come in from CSTAR, that come into S3 that go into Lambda that come in here that does exist today and that's green.
Then we have a bunch of connectors that happen here that's green. Are we doing anything with this today? I don't think we are, but is there anything that we need to do here? I think it goes to Cognito and other places where, as an example, G Cognito and results processing...
You wanted me to go look at results processing, which I'm going to make time this week to go to. So just for everyone's knowledge and know results processing has been a bit of a pain. Not the process, not the results themselves, but like when users can see results versus when they don't see results and what have you...
So I'm going to take some time this week. I'm going to dive in, and my plan is to migrate it away from whatever's happening in these connectors into this new MS stuff. Once Antonio is done with his work, and in so doing, I'll make sure that it's nice and tidy so that it's not causing any issues.

**Stace | 55:38**
Yeah, and that's excellent. In team like... I think this is... Hey, we know it's brittle at best right now, and we're going to have to deal with it a lot in the coming weeks because of the participant stuff I was talking about earlier, right? We have to strangle out the lily events, make sense of what updates are going to be left in CSTAR, but really be creating all of the Cognito accounts and users and relating results, fulfilling results with orders coming from recurry, right?
So we're going to have to open it all up for that. Then I don't want to go through the short-term pain we just did with even simple things like trying to refactor logging and PDFs. Plus, in that same time period as a business, we're introducing phlobotomy at scale across all screenings, which means new blood tests, new laborator codes, new spot result codes, and new diagnostic processors.
So again, we want to have it be in a place where we can make those modifications and add new products and services with higher confidence.

**Sam Hatoum | 56:51**
So yeah, my plan is to just go look at how it's been done today. Rip it out of the connector, put it into EME, and do any hardening around that. Get this deployed along with the rest of the staff. It might take a week or two, but just in the background, I'm going to be working on that. I wanted to let everyone know.
All right, we're at time. Thank you. All right, we do need to discuss at some point if the architecture session is not the right place for us to discuss those high-priority items that you know in the top right quadrant, we do need a separate session for that then, so let's please get that on the text website. Yeah.
Alright, thank you.

