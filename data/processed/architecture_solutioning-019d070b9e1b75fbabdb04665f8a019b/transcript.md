# Architecture Solutioning - Mar, 19

# Transcript
**Stace | 00:15**
Who has our agenda for this?

**Jennifer | 00:17**
Call in the chart. Okay. I think you have most of the talk. Add in. If we have time.

**Wesley Donaldson | 00:33**
Yes. I connected with Sam. I said. He said he would be here, so we can give him a couple more minutes or we can jump straight into one. That's a little perfect timing. So the items that were on the topic list.

**Jennifer | 00:46**
I see you. S.

**Wesley Donaldson | 00:49**
Perfect time. As usual, the items that on the topic list. The field mapping in the Mandolore channel. 
I think we've gotten to a good place on this. So I left it on the list, but I think we can actually remove this. I don't think it's critical. I think Jeremy has a good understanding of what to do here. 
But if we want to touch on that. And then we have the Emmett pattern. Antonio we were wanting to present the patterns that we're going to deploy using Emmett on the topic list for a couple of weeks now you want to use as an opportunity for us to go through that. 
And then Jiffco asked for time back. So I'll skip the I am IE. Rolls. Reusing IME roles within the PR workflows. And then the only other major thing then was around the order duplication, which you, all of us and Jeremy can speak to have asked them both to attend it. Specifically, they asked, there is if we want to use an RDS as a mechanism for removing the duplication of orders at the time of placing the clicking the place order button. We have the conversation that we did for the pre mortem last week. Friday. 
I think that required additional distillization of the items that we identified in prioritization. That would be another good topic for us to tackle. 
Happy I think maybe I. Antonia, if you want to just knock out the. The Emmett pattern conversation. Just because it's been hanging out for about three weeks now.

**Antônio Falcão Jr | 02:23**
Yes, sure. Again. Sorry. I'm share my screen and tell you guys what we have about it. Just clean up a big mi.

**Sam Hatoum | 02:58**
I forgot to bring popcorn. [Laughter].

**Wesley Donaldson | 03:06**
Let's see if I get Chirby to join.

**Antônio Falcão Jr | 03:11**
Put it aside so we can see you guys. Okay, good. So, Tim, the whole idea behind MT Patterns is pretty much to take advantage or make the most of the framework itself. And the goal behind it is pretty much the same we have when we adopt any kind of framework, we want to abstract some unintentional or some technical complexities to give us the opportunity to keep focused on the business and to speed up our process. 
So we know already the benefits from event sourcing and projections and all these, coming reactive opportunities and. But at the same time, we don't want to struggle and being doing too much configurations and choosing between Multiple Alternative Designs to accommodate those patterns. 
So Emmett, it's a quite mature library. Oscar is one of the most active even sourcing experts in the community nowadays. And once this it is an open source has this extra benefit of having multiple different people different business are areas using these and so meeting issues and helping to improve or to making this library even more productive and business ready right. 
So for these, work specifically talking about the adoption of Emmett here, we are looking on these mostly on these on it decider evolve in the projections patterns, right? Emmett is the CQRS event sourcing. Design level abstraction, and it does work alongside with Pongo. 
It's a different library that combined with. With Emmett can handle the event store and the projections on the other side. So with those two libraries combined, we have the full ecosystem from CQRS from. 
From projections from infrastructure. But it is not our case. Okay, in our case, we do have Current as our primary event store mechanism. It's a very strong, very serious product. And we do believe that Current as event story mechanism has a great future. 
So Pongo as a projection abstraction doesn't have fully integration with or extensibility for different event stores yet. So talked to with Oscar they plan to make this in the closer feature. We can take Pongo now make our async projections just like we have. 
And in a closer feature, we're gonna have the opportunity to use fully capacity from Pongo. Stuff that we don't have yet, but we may need. We may like to have it, actually. Like in line projections or other kinds of nice stuff. 
Right? So pretty much what we have so far, we have Emmett delivering, this CQRS and interface level to the event sourcing with its decider and evolved patterns of the states, right? And we have pongu having us the ability to abstract the projection integration. I may have something not being shared properly. I'm sorry guys maybe there my windle maybe think you guys can see my ID now. Good. 
So that's all. Let me jump to the code will be more interesting. So I have placed on our apps folder. We do have this mt patterns project here packet here with a simple shopping cart. Why shopping cart? 
Because it's consensus. Many of us are quite familiar with the business, real realistic around it. So just to simplify stuff and on this folder I can simplify this. But yeah, we do have the components, the pieces around Emmett right. Very simple, straightforward. We do have part of this already, for example, our commands definitions. Nothing special. Not nothing different here from what we have been doing so far, right? 
And alongside with the events definitions. But what is new here in the specific from Emmett design is the decider, right? We have this decide file and rather than place our business logic our aggregates invariance inside of an aggregate component. Just like Domain Driven design based, we have this on this decided level. 
So here we can keep the invariance from our business process. So in this case, our shopping cart is our process and we care about it. In variance. And we can handle these invariants right here on this, decider. Pretty much. 
It's a switch that goes through every command, every user's intent. Intent and based on a specific rule, decide to transit the estate to the new one, right? And then we do that via events. The pattern is pretty concise and simple to adapt, easy to maintain and to evolve. 
Right alongside with the CR, we have the state. The state is the class that or is the component that's supposed to replace the aggregate, as you guys have noticed so far. The aggregated kind of a monolith representation of the business process with the state and the invariance altogether. 
And 1 in this decide pattern, we have this splitted to simplify a bit the game, the implementation. Right.

**Sam Hatoum | 10:37**
Okay, sorry, was right there. Just real quick. I just want to see, questions from Harry Day and Jeremy. You guys have been working with this like. Any questions so far on the difference between how we do it today versus what these look like in terms of the deciders?

**harry.dennen@llsa.com | 10:52**
Yeah, not really a question, but I mean, Gay and I were having this discussion this morning, around, you know, deciders. I mean, this switch with, the specific those would be events, right? Event types. 
Yeah. I mean, this effectively exists on the aggregate. But, you know, like ANT is saying, it is currently all on just this aggregate file. So this is good. And we're kind of realizing that when events come in, it can't really just be here's your event, do the thing, it's here's your event, go decide what to do. 
And I think that was the part where we were deciding or we were making decisions on how to implement that. And the pattern was just whatever you did in an aggregate, which has been frustrating. So no, this actually looks like it will help.

**Sam Hatoum | 11:47**
One more thing right there if you just go to line 15 and change the type, just put some crap in the string. Although it's strings. It's actually is typed. Just fi. So ant line 15, just go change the string the shopping cart opened.

**harry.dennen@llsa.com | 12:01**
Yeah, put an s on or something.

**Antônio Falcão Jr | 12:04**
I see what you mean. Okay, yeah, we can do that. Yeah.

**Sam Hatoum | 12:08**
But 23 yeah, corrupt the ad product item name on line. 23 just put an extra character inside that event near me.

**Antônio Falcão Jr | 12:20**
23 something like this yeah.

**Sam Hatoum | 12:22**
Yeah and that there you go. Now it's failing because basically it's using it is, but it has to use based on the strings. It's a bit annoying, but it is typed.

**harry.dennen@llsa.com | 12:33**
Well, I mean, it's already like. So with, command handlers, it's already using the strings like that as well.

**Sam Hatoum | 12:40**
I mean.

**harry.dennen@llsa.com | 12:41**
I don't I guess you want to go and put string enoms everywhere and do types like that.

**Antônio Falcão Jr | 12:47**
If you go to.

**Sam Hatoum | 12:48**
Can you go to the definition of this event real quick? I just want to show everyone how it works on a type types level.

**harry.dennen@llsa.com | 12:54**
Yeah, because that was the other thing that was bothering me a little bit is like in our. So when we currently in the current pattern where we have the commands and I'm a little curious about that. How that's implemented here is that we return a higher order function, and in that returned function, the first parameter has the object with all of the command methods on it. 
So when that hierare function is returned and then invoked, the string of the property of the object is what is called.

**Speaker 7 | 13:30**
Yes.

**harry.dennen@llsa.com | 13:31**
Seems a bit crazy.

**Speaker 7 | 13:32**
And that event state mapping. Yeah, but not all of them do that, right? So it's like there's a layer of complexity there that, I don't know it'll go if it was absolutely necessary.

**Sam Hatoum | 13:46**
It should go away. I'll tell you in just a second, like, we're gonna hover over that in a second. Is there a type defin? This is a type definition, this is where you define. You see, line 13 is the string. 
That's what gets typed that that's how it knows an event. The off type product item added, which is actually ends up going into the current DV as well. And then here are the parameters for it, right? 
And that's the way you define it and that's the type system stay. So got your hand up?

**Stace | 14:13**
Yeah, I guess maybe I'm a little confused a level higher. So is this pattern on the client and the server because I thought this was mostly between like kind of connectors events all related to the event store.

**Sam Hatoum | 14:35**
Anything related to event sourcing here. So projections. So we're looking right now, right?

**Stace | 14:40**
Why are we looking at like why do we build something to do with a shopping cart? Because we don't see that that's between the client and recurring.

**Sam Hatoum | 14:48**
Yeah, story. Just Antony use this as an example to demonstrate the domain. Like we basically remember we said we're going to do a hello World implementation of MME and get it deployed and get it all functioning and working. He just used the shopping cart as an example that we can all relate to.

**Stace | 15:01**
Okay, I was going to give one might be a different conversation, but I'm wondering why we didn't use the order that could have been used instead of a week spent on something that's just an example we're going to delete and throw away.

**Sam Hatoum | 15:15**
On honestly that left. So I see where it says shopping cart like that sliced architecture like we just got like it is this easy, like we're just going to wipe out and enter the real domain very shortly. This is just proving. Remember we said prove three things can we get events coming in to like sorry deciders to get the events current. The next one is projections and the next one was the graph QL. This is proved we can do all that. Those are copy paste, they're throwways, like they're super quick to build. 
So I wouldn't worry about that at all. The proof was the infrastructure and the architecture, not necessarily the business domain itself. That part is what we're now going to build on top of it.

**harry.dennen@llsa.com | 15:48**
Yeah. I mean, my understanding is using a shopping cart allows us to just not consider our own domain because everybody understands the shape of a shopping current, so we can just focus on the architecture of. Learn.

**Antônio Falcão Jr | 16:01**
That. That's correct. Yes. Okay, that let me walk through a bit more and we can you guys can keep, you know, stopping me whatever we want to discuss, is that okay?

**Sam Hatoum | 16:15**
Yeah, I think, sorry, go ahead. Yeah, just, I think just now that we've said this, if you don't mind, just going back to the decider one moment.

**Antônio Falcão Jr | 16:22**
So, yeah, sure.

**Sam Hatoum | 16:23**
So now where you see, like the switch case, we can verify the various, event types. And then this is where decisions happen, right? So like you can see between lines. Case ad product item line 24. If the status is not open, then throw an error otherwise do blah. One more thing stay. 
Sorry, this is actually the example from Emmett's directory, so we haven't done any extra work here. We didn't spend extra work trying to decide this domain. We just took the example that's there, get the infrastructure working and wipe it and carry on.

**harry.dennen@llsa.com | 16:55**
Can we look at the commands?

**Sam Hatoum | 16:59**
I look the same.

**harry.dennen@llsa.com | 17:03**
Okay, so command and event, they're just objects that will then trigger some actual logic.

**Sam Hatoum | 17:11**
Actual subage. Basically, like command, event and state. Actually, they're all the same. So if you chose state 2 on the left and yeah.

**Antônio Falcão Jr | 17:19**
They state was yeah.

**Sam Hatoum | 17:21**
And it again.

**harry.dennen@llsa.com | 17:24**
Let's go into a specific, side effect. And I think the example would be an event comes in that we have an order and a participant, and the side effect is that a Cognito account needs to be created. Does that go in the decide file to decide with us?

**Sam Hatoum | 17:49**
Go ahead, Antony.

**harry.dennen@llsa.com | 17:52**
I mean, if we want to stay in the shopping cart domain. Let's say. Likehopping cart purchased. I don't know.

**Antônio Falcão Jr | 17:59**
I could be the same. I think he's looking for kind of a event reaction.

**harry.dennen@llsa.com | 18:04**
Yeah, I'm looking for where the if a command is issued and a external side effect now must occur. Where does that fit in it?

**Sam Hatoum | 18:14**
It doesn't, but sorry, go on, Dan, I just want to make sure.

**Speaker 7 | 18:18**
So I'm just trying to orientate myself as well, right? So, like the decider is effectively replacing our command handlers.

**Sam Hatoum | 18:24**
Yes.

**Speaker 7 | 18:25**
Right, it's taking in a command and then returning out an event.

**Antônio Falcão Jr | 18:29**
Well.

**Speaker 7 | 18:31**
The evolver is what's effectively or I guess or a evolve here, right? It's effectively layering on changes to the state, right? It's our state reduced.

**Antônio Falcão Jr | 18:45**
It that's correct. It evolves the state itself. It does apply the events to the state make the actual state transition of the process. That's correct. And behind the scenes Emmett does persist this in the store for us so in between yeah in between the decision and then in the evolution it does just after it does push this to today store.

**harry.dennen@llsa.com | 19:15**
Okay, so the evolver will take the event and return the state. So the evolver is effectively what in the current pattern would be a projector.

**Antônio Falcão Jr | 19:30**
Not a projection specifically. Sorry, Sam, projector. I see what you mean. Yeah, we can say that. Yeah, it's.

**harry.dennen@llsa.com | 19:41**
Okay, so what is the projection? It's a different file how those two talking to each other.

**Antônio Falcão Jr | 19:47**
Yeah, that's correct. This estate this evolve is pretty much specific to the process estate itself, like the source of truth, right? The projection is more related to read models is how EMET treated state is the processes state like right side of the application and projections are red side of the application taking so.

**harry.dennen@llsa.com | 20:12**
Evolve as right side projection with re side.

**Antônio Falcão Jr | 20:18**
Yes, pretty much we can say that, right? Sam, to avoid confusion because, the projection will consume the events as the same way and they in that kind of shape will evolve as well. But the component is specific is the evolver is related to the right side of the application.

**Sam Hatoum | 20:41**
Do you have you used in here the evolver in the projection or is the projection just a, creating its own re model? I know the answer, but a rhetorical question.

**Antônio Falcão Jr | 20:52**
The projection has, different abstractions specific from Pongu. It does consume the events as the same way, right? But in this case as we are not using the native integration from Pongo to the store as we would have in case of using post grese as event store is not the case yet we are using current. 
So the projection here is acting more like a class that be invoked by the connector. So the connector is invoking the pro.

**Sam Hatoum | 21:33**
And then let's SLA the wrong side for the guy. So like, just to explain it one more time, if you look at the decider path, the decide function, it uses the evolve. So on the left you have the evolved. Can you just open up the evolve one second on the left hand side? Continueo evolved the one. 
Okay, so this is building state, right? Building state of the current system as we understand like as we get new events, this is evolving the state of the shopping cart. Now this is what we use to decide. 
So the state is being continuously evolved. New order comes in whatever happens like results are processed. All of these things are building up. State of the current system. Recently we had this trouble, right, with knowing what state the current system is in when, like if somebody has signed up but they were first seen, and if it were, they weren't first seen. Blah, right? All of that stuff. As those events happen, you build up state and that's internal state for you to use for making decisions. 
Okay, so then when you hit a decide function, if you go to the decide now. Sorry, Antony, I'm remote controlling you here. So now, when you come in here, if you look at anywhere that says state, like you see state shopping cart at line six, you've got state coming in. 
If you can just click on state. So we can highlight it everywhere in the app, right? That stake is what's being is. I wish I could point with this, it's so annoying, but exactly that state that's being highlighted right now that in your decision now you can always dodate state that's been evolved by the framework already for, right? 
That's what you use this evolve for. You evolve the system state so that you can make decisions based on that state.

**harry.dennen@llsa.com | 23:10**
Yeah. Okay, can I see if I understand? Let's imagine in our world, we get a result, right? So the result comes in, and we would need to evolve the state based on that result. So we would run interpretations and we would store the state. This would produce a command. No, it could produce an event.

**Sam Hatoum | 23:38**
The as event. It would produce an event. So the state is always the all the events that have happened so far, right? And then what Emmett does is it keeps track of that and it can actually persist it as well so that you don't have to worry about that remodel stuff. 
So you can then next time you load. So this load.

**harry.dennen@llsa.com | 23:55**
Just loves the state at that point. Now is that state. Okay, so this is where it gets complicated. We start starts looking like a projector, right?

**Antônio Falcão Jr | 24:06**
It does it. Conceptually, it's pretty much the same, but the intention is differently. Like this state is where you're gonna look to take a decision to, you know, based on your invariant and they state you're gonna decide over the user's intention. That we can say it's the right side of the application, the command side of the application. 
So the state is to serve the comment side. But it is conceptually a projection as well in more primittive way to see you are correct. But we treat it as I state where I decide and the projection it's an anemic rid model. There is no logic involved it around the projection. 
That's right.

**Sam Hatoum | 24:54**
So let's have not now that we've said that does that make sense? Any more questions on like state here as we call the state with the evolve of state, it's all evolution is actually even projections are evolving state. 
But the state that we're talking about here that gets ingested into decisions is state for making decisions. That's how to think about it, which is how it was in aggregates. But they're just separate now. 
Yeah.

**Antônio Falcão Jr | 25:14**
We just split. Yeah. The state is the. The splitting of the aggregate into two classes, right? If we combine the decide and then state we have an aggregate. I think it is unit tests.

**Sam Hatoum | 25:28**
These function very easily. That's one of the massive enablers here. It's functional, right? That the side function is functional, it's stateless.

**harry.dennen@llsa.com | 25:38**
So this so the decider is the one receiving commands and producing events.

**Antônio Falcão Jr | 25:45**
Perfect. And just to clarify your preview question when we receive an event or saying better when we want to react to an event, way to do that to achieve our state is by translating that event in an edge level into a command that our decider expects.

**harry.dennen@llsa.com | 26:09**
Okay, so that currently is a subscription. So where does it yeah.

**Antônio Falcão Jr | 26:16**
That's correct. You're gonna subscribe and the sub in the subscription, you're gonna consume the event, translate that event in into command, and then pass a command to the specific process handler. You want to react to that. 
That's. Yeah, that's pretty much like. Honestly.

**Sam Hatoum | 26:34**
I just want to do. I just want to do a fly over. I think we can do two things here because there's a group of mixed like Arcyde level architecture as well as on deep code. And then we're going to wreck really deep on the code. 
I think we can definitely like we can go as deep as everybody wants, but I want to make sure to fly over first of the different features that we've got here, and then maybe we could do follow on sessions for a much deeper dive like. 
And I'm following sessions. I mean, like today, tomorrow, but just to unlock the rest of the group.

**Antônio Falcão Jr | 27:00**
Let me just show the graph quail side and the projection side real quick, and then we can move forward. What you guys can.

**Sam Hatoum | 27:07**
Yeah. So just if you don't mind clicking on the projection that you are at just a second, one more time. I just want to make sure that you cut part first. Right. So this project, which looks extremely similar to this to the evolve of state of the evolve function. The difference is like, instead of, state over, there's got like this concept of, like, you're saying doc, which is the document. 
So this is actually an interesting. I mean, it's only a name right here, but like, the reason it's interesting is because you're looking more like a document, as in the state of it as a table, a database table or a Mongo DB style document. 
Like it's more of the thing that I want to actually present to the rest of the world, right? But otherwise it looks extremely similar. It's a switch based on the events. And the state you build here is based on the demand, not based on decisions you need to make based on the right. 
Because if you really think about. Like, they're very close, but you don't want to mix them. The state might have very sensitive things. Right. That we don't want to expose to the world. Whereas this is very explicitly saying this is what we're going to expose to the, you know, public API or whatever.

**harry.dennen@llsa.com | 28:05**
Yeah, this maps one to one with what we already have. I mean, right, it's a giant reducer to produce a. What do you call it in a reducer? The ACC the accumulator is what you end up returning and showing to people.

**Sam Hatoum | 28:21**
One last thing. Antonio, I don't know if you have a. If you actually got the end the code, let's post the link here to the documentation. If you just click on that on your screen to share, please. Yeah. This is Chan. 
I think unless you're just sharing your ide. Then we won't see, I guess. But in here you have the concept of reactors. You're asking about reactors, Harry. And that's create reactor like this. And so it can you know, it can handle certain message types and then you can basically react to event what effects.

**harry.dennen@llsa.com | 28:52**
Okay, see, this is this was the thing I was getting a little concerned about in the deciders because, I mean, any programming pattern is generally just segregating the decision of what to do versus the thing of actually doing the thing. 
And right now we put them together in the act in the command handlers, right? You decide what to do and then you do the thing at the same point, which is generally less maintainable. Because I was serious about if you if you've got a decider and it's making the decision of what to do, then the reactor would then go from there and do the side effect, right? 
That's that is what I want. That's good.

**Sam Hatoum | 29:30**
All right, so we'll you know, it's but like how easy they are to write like basically it's a when then but these can have state they can build up their own state as well, like thetent. So, yeah, you can do that too. Cool. 
All right, and then you want to show the GRAPHQ well.

**Antônio Falcão Jr | 29:49**
Yup, let's go there. 
Poops just a second super graph okay, graphqlmm we have the mt resr right? Just to show you guys how it's the regular reserver we have. The only difference is how the handler. Signature works, right? We have this estless handler in this case. 
So that's pretty much catch the store context and the stream ID. And then we can, based on the state plus the command, take the decision, right? And then the EMET will pass this command through our decider. The decider will produce the event. It will evolve our estate. 
It's going to be persistent in our store and then we are able to react for that or to subscribe for that. Not much. Nothing that different here. Let me show you guys the career side. So we can consume, via Pongo pretty much this way we retrieve the collection. On this example, Pongo is using a document style projection. We can make that column table relational database. It doesn't matter, actually. In the collection side we do have Mongol style API available for f ftering, and the other way around, we do can use regular SQL syntax for that. 
Okay, and last is the projections. 
It's st bit lost this second. It's right on supergraph mistaking projection. S nice. Yeah. So as you can see, we have those consumers reactors, just like we saw the example. And then we can define what we want to handle and what our process processor ID. 
And then based on our specific collection, in the event, we can just evolve. Pretty much evolve per se, right? We can just apply those events to our collection to our projection module actually, and then persist that. Emit will persist that in the projection site for us, in the projection database for us. Really straightforward.

**Sam Hatoum | 33:36**
And as the same reactor that updates remodels you would use for side effects.

**Antônio Falcão Jr | 33:42**
Yeah, because, Pongo does have another specific extension for projections, but it's only available on Postgres. Event story specific the external per se, the external, API for other event stores is the reactor because it's pretty much the same concept, right? We need to implement our persistent. 
It's not made behind the scenes like it does. Yeah, the post Grise event story, but yeah, it's the same reactor. We can use it to react as a side effect. Another process reacting to this event. Or we can use it to project.

**Sam Hatoum | 34:33**
And final question. This is all on like running in the infrastructure now, right?

**Antônio Falcão Jr | 34:38**
It is full functional. Yeah, I did those, mutations and queries the bracket sorry, it's missing the word, but, they marked as not used so to avoid accidentally use it. It's more as an example here. I appreciate it.

**Sam Hatoum | 35:06**
Cool those questions and we can move on to the next subject. But that was the flyover. We got MMET it's deployed, it's being used, we've got the patterns in here now. It's okay. So I just starting to implement all the patterns.

**Antônio Falcão Jr | 35:23**
Yeah, as you can see, I put a prefix to avoid confusion and Mark has deprecated, so just to avoid us to confuse it in any way. Question guys. Gonna see any other part of the implementation?

**Speaker 7 | 35:47**
I think I've got the general gist all the way up into that last bit, but I don't want to take up any more time in this sitting here.

**Sam Hatoum | 35:53**
So it being what? Sorry. Just understand.

**Speaker 7 | 35:57**
I got the general gist, but I think I'll open to the very last bit there where we're saying that we could use effectively reactors for side effects and to project.

**Sam Hatoum | 36:08**
That's right. I mean, it's a reaction, that's all. I'll give you ten seconds. It's literally when an event happens. When an event happens, you want to react by either updating a re model or by firing a side effect or batch you. 
Okay, that's all it is. So reactors are used to trigger projections. Because your. It is a reaction to events. That's correct. So we have the patterns, they're all in there now, they're in production as it, so they're like deployed. 
So now it's a case of let's start putting the actual orders and everything else on it and let's go. 
Alright, next topic nice.

**Wesley Donaldson | 36:57**
The next one I think we need to tackle is just a decision on. Jeremy's here to walk us through it. A decision on how we're handling duplicate orders on the backend as part of when the user clicks check out in recurrly checkout. Once you click that placewater button, how are we handling the possibility of duplication? 
But proposal was raised of using an RDS as a mechanism to keep track of what was placed and then compare it to the incoming order and then flagging that incoming of duplicate or not German. Do you want to share more?

**Speaker 8 | 37:31**
Yeah, let me find that, ticket, I have a bunch of tabs open.

**Wesley Donaldson | 37:36**
It's. 662.

**Speaker 8 | 37:40**
Okay, thank you. I have it open. Let me share my screen. 
Okay, I believe you can all see now. Yeah, so the current state of when this was written anyways is tickets are I think a few or two or three weeks old, so might not be up to date, but right now there is an in memory map for the graph. Ql land that tracks whether or not an order is a duplicate. 
So right now there's two ways we try to avoid duplicates. When you click Complete Purchase or whatever, once you click that button, the button is disabled. So that's one way we do it on the client, and the other way is with this in memory map. 
So one of the solutions I came up with was like was it said just have a database. So I have some documentation here if you want to look into it more. It's get 662. But in the one of the requirements I believe, was we need to have some sort of management of, you know, who is this user like in their clients. 
So we have a session ID to kind of manage that. That way if someone. It's just another way of trying to get someone to not duplicate a purchase. My idea would be you have two tables. So you have a transaction table which would have the session ID and the appointment. Good that they use. 
You know, a duplicate can be a duplicate in many different ways, but for our situation, for right now, I just figured it would be a combination of session ID and appointment. Good. And then there's a second table that is just a duplicate transaction. 
So it has the session ID and transaction ID from the first table. And the reason for that is we probably want to know how many people are actually doing a duplicate. So the whole point of the second table is to just manage that and know what's happening. 
And seeing if this is like a big issue or if it's a small issue, it could help us, you know, track bugs. Possibly if we see a lot of duplicates or we see no duplicates see what I got here. So when the create purchase arrives, we query the transactions to see if the session ID and a appointment would match. 
And if it matches and the stat is complete on the record in that transaction table, we know that it's a duplicate and we insert the record. If it's found in the status pending, we can send back an error to the. 
Maybe not an error, but just something that says hey, this is in progress. Please wait. If it's complete too. We would sit on the front and like, hey, this order is complete. Because we don't want people to necessarily know, like, this is a duplicate. They don't need to know that. 
That's something for our record. So the idea was if there is a duplicate, we market that someone tried to do a duplicate, but we just send them back the data that they need so they know their appointments ready and all that stuff down here. 
Yeah. Question.

**Sam Hatoum | 41:05**
Yeah, so what this is the this is Onri Curley this is the user goes in, they make a purchase, we've somehow they end up in a duplicate like the same order, they pay twice. Like, is that all you defined duplicate one second.

**Stace | 41:17**
Yeah. I'm sort of lost on where this use case came from. Like, is this are you talking about database SQL light on the client?

**Speaker 8 | 41:29**
Yeah. So the let me go over the original ticket. So for this ticket, we want to validate that orders from the client. We're not a duplicate. So any time they hit create.

**Stace | 41:41**
From this come from reporter Wesley. Like, when did the business say this was a problem?

**Speaker 8 | 41:53**
I don't know. When the. I can check the history of the ticket. This is something.

**Stace | 41:58**
The solution. I'm just a little concerned that you may have been put to work on something that we didn't actually need to do.

**Wesley Donaldson | 42:06**
Now I can go back and find the. When I.

**Stace | 42:09**
I use a lot of infrastructure to save an error in a database. Potential error that may never happen.

**Sam Hatoum | 42:17**
So we go to yeah.

**Yoelvis | 42:18**
I think this is mostly for I ency in case the users somehow hit twice the complete PA so they use the API.

**Stace | 42:29**
Whatever can be solved through. Don't do that.

**Sam Hatoum | 42:32**
Like highde button.

**Wesley Donaldson | 42:34**
Yeah, it'.

**Jennifer | 42:35**
And I think there's retries with events and everything. Just in an event system, do you need the item of.

**Stace | 42:43**
The order's done? And if someone comes to the workplace and orders the same thing, well, that's their fault.

**Sam Hatoum | 42:50**
Yeah, I was gonna add I even if this is a requirement, like if two orders come into the event store and we need infrastructure to like figure anything out, it should be all done through the eventing system because we already have an append log that says the order happened and the order happened again. 
Like we will absolutely have that. And then it's a projection to see if in order has happened twice and how many of them have happened. And like the track, the log, the append only log already contains all this data. 
So I think this is a bit of CRUD thinking layered on top of the VN thinking, which we can dig into. But then, as you say, it stays like this may not be any requirement at all. So two things. Is it a requirement at all? Is the first question. 
Second concern then is if it is a requirement, we should be using the inventing system and not creating new tables. I mean, good work for putting it together. Yeah.

**Yoelvis | 43:45**
The. I want to mention that Recoli has a duplicate transaction error. I haven't tried that one, but it's most likely to fail if we. TED to Jeremy found that as well. It's most likely to fail if we try to do the same thing twice. 
But yeah, this is mostly an item. Cor ticket probably is. What I see is like in case for whatever reason if we are trying to use the complete pushhes for recording twice and how can we handle that in a nice way? 
Yeah.

**Stace | 44:28**
That place. Unfortunately, right? We can't do. Do. If it were to happen. Right? If I accidentally place the same order and pay for it twice and recurrently, we can't be duped at the event level because there are two separate orders with two separate monetary transactions, right? 
It's got to be that way in our database because we have to resolve it, right? Someone has to go identify it, cancel one, or we fulfill both, I don't know. Right?

**Yoelvis | 44:55**
So this TA is mostly about this allowing the user to hit the create pushes twice. Just this allowing the user to comp e call in the cool API twice for the same data. The same.

**Sam Hatoum | 45:11**
Right? But you. You still. You're in an eventual consistency problem, no matter how you do it. Because there is inherent delay. And like when you click the button, if you've disabled the button, that's one thing, right? 
But if you have like if we're talking about designing a system that can only take an order once, we can do that on our side at the point that we receive the order. Like, don't be thinking in terms of databases, be thinking more in terms of Stream design because we can make a through optimistic concurrency. When the order second order comes in, we can decide if that's the same order and we can reject it at that point in time as well. What I really want to encourage everyone against here is thinking automatically that we need a database anywhere in order to do any kind of logic. 
Like as soon as you say that, you've gone completely off piece and it's the streams are there to protect us. We have optimistic concurrency and eventual consistency. Those are the two things to be thinking about. 
And that's how if you want any item potency, you would do it there. And I can help explain that to you. But don't resort back to type, which is we do item potency by way of, you know, getting like a database to do transactions for consistency. 
That's going down the wrong path and it will end up hurting the architecture. I can dig into it more.

**Yoelvis | 46:26**
I totally agree. I'm just trying to explain that this is not about the event thing that happened after the web hook this idea here. Maybe I agree that we don't need it, probably not for the MPP or anything like that, because it's not likely to happen, I recall. They should be able to handle those issues gratefully. 
But the point here was not about orders happening after the recuing pushes, it's just this allowing the user to complete bushes in recording in the API level. When you hit the endpoint, okay, the endpoint should be probably smart enough to say, okay, this is the same, exactly the same input. We don't want the to call re recordly to create this thing again.

**Sam Hatoum | 47:14**
Yeah. I mean, but even then. Like even then. What I'm saying is even then, if you do want that, you can then have a command handler that goes into a decision that gives you a decision there and then to whether you're allowed to do that thing or not. 
So if it's an API on our side again like separate to the web hook system, totally understand that it's still a stream concern rather than a web hook event concern. So yes, the web hook is too late, is what you're saying. I understand that. Now we're saying at some point we want to kind of before we hit recurly, we want to hit our system. Even if that's, the way we do it, we can on our side hit it to a stream in C in our event store, which can then do through optimistic concurrency. It can come back. The first one will say yes, the second one will say no. 
And it'll give you a knack, right? So even then, yeah. Stay away from the bases is my point.

**Yoelvis | 47:59**
Yeah, exactly.

**Sam Hatoum | 48:00**
Yeah, we use streams, not databases to achieve a much cleaner way to do that.

**Yoelvis | 48:06**
Right? Because we are following the event sourcing.

**Sam Hatoum | 48:11**
Yeah, exactly, you're right. And that will be even quicker and way less complicated than building tables and migrations. And, you know, all this baggage that we have to carry with us from here on because of that, we just have. I'm still a bit confused at how we would call our system first before we call recurli because I understood the transaction is between the web and recurli and back. 
And like, there's no. There's nothing to talk to our system at that point in time. Is that still correct or have we changed anything that?

**Yoelvis | 48:39**
I mean, in my understanding, we don't need this for the. For now, it's something that we can keep in our backlog in case we think it's worth taking a look later, but it's not likely to happen because we are disabling the button when the user is completing the transaction is processing the payment. 
And we are doing some extra stuff like.

**Sam Hatoum | 49:09**
I think yeah.

**Yoelvis | 49:10**
Using recording and recording is like supposed TOS to make that transaction fail.

**Sam Hatoum | 49:18**
Got it. If we're punting it, we're pun.

**Wesley Donaldson | 49:20**
Quick. This was part of the conversation that we had, the proposal we had like the last week of like, do we want to have that object on the client side that keeps track of the session ID, the recurring ID, like have a la owned object entity that tracks all the different foreign keys for the different systems? This ticket came up around that same conversation.

**Sam Hatoum | 49:41**
Okay, all right, we're not doing it right. Is that the answer?

**Wesley Donaldson | 49:47**
Yes, he know.

**Stace | 49:49**
My thought would be and again, the solution that was put in and I thought that was into it. I think it's a thorough.

**Sam Hatoum | 49:58**
Work on that.

**Stace | 49:59**
But in direct answer to that question, not sure we need it. So I think this goes on pause, right?

**Wesley Donaldson | 50:03**
But I think it's to part with a long SCA re lir some sort of people everybody.

**Stace | 50:05**
We could launch and then layer in some sort of duplicate protection if this emerge as a problem.

**Sam Hatoum | 50:12**
Yeah, I'm duplicate protection. I'll put it like entirely as like client side state for the most part.

**Stace | 50:17**
That's what I think too, right? And I think right here again, all the comments that we're going back forth of if we're going to do event sourcing leaning into that pattern. But even on this. So. And I'm getting a little nervous that we're we'd be getting into the visitor session tracking.

**Sam Hatoum | 50:32**
But it would just be like, okay, do this order. They'll contact you and they'll be like, hey, I spent extra thirty dollars, sure, his call center will refund it, right? Like that's yeah.

**Stace | 50:41**
Exactly.

**Sam Hatoum | 50:42**
Yeah. All right, we've got nine minutes, let's cover one more. Come on, we can do one more. What else we got? And by the way, good work on the discussion. But then don't let the rejection of a solution be a bad thing. 
Like the more solutions we reject, the better, right? Because we end up with the good solutions going through.

**Stace | 50:58**
Hundred percent, right, this task someone had to take on and this was a good solution for it. And that's what.

**Sam Hatoum | 51:05**
These discussions are for.

**Wesley Donaldson | 51:07**
Jennifer do you want to attack maybe MMA or one of the other items you flagged?

**Jennifer | 51:12**
Yeah. I was gonna put up MMA first. I think it's going to be a rather quick conversation.

**Sam Hatoum | 51:22**
Was just gonna say I could see Jennifer, you and Anma ring. That'd be interesting.

**Jennifer | 51:28**
Every time I see MMA, I think about that. We should get our participants to, like, start fighting when they want a membership. Whoever wins this round gets a membership. Okay, let me share just the ticket that we've got. 
So we have work going on in Endor to, kind of take in a payload. And it's a relatively simple payload. All we need is the participant ID and the amount, and then we can go and update their membership status with that. 
And so with that, we have one ticket that we're going to need for the infrastructure that you guys have built. And Beth created that here. I import all member accounts. Is that okay? That that's a very one.

**Stace | 52:31**
But we will need this, right? If on the 30th. Really before the 30th. But we are moving all of our active members to the production recurrly account now, right? So they'll be there with PK goods and account IDS and order IDS for that membership and things like that. 
So if then in theory, right, we will get order updated or subscription processed web hooks as those items as we process renewals or cancelations or anything on that, we'll need to hydrate our Thrive data store with these same things, right? 
So there's a one to match. Otherwise you can get an order update on a participant that won't exist and thrive. Right? And you couldn't process the update. So thats what that is. So that should make sense to everyone, right? We're going to have if we're going to import a bunch of people into recurly, we'll have to import them in its five.

**Sam Hatoum | 53:33**
Maybe we import them into thrive and then as a reaction, we import them into recurring.

**Stace | 53:40**
Well, they're already ahead of us.

**Sam Hatoum | 53:42**
Right? They're lu at us actually. I mean they're everything in ready right now.

**Stace | 53:48**
Yeah. It.

**Jennifer | 53:50**
Like for new ones back and forth.

**Stace | 53:52**
With payment processors and token migrations. And there's a whole road map that's happening. So they'll be sitting there waiting for us with updates for us to consume by the time we deploy.

**Sam Hatoum | 54:08**
Some in particular I want to read it.

**Stace | 54:10**
But there's some data parity that's going to happen, right?

**Jennifer | 54:12**
So I press enter. It's supposed to there is. Yeah, this is the one that we. But you know.

**Stace | 54:19**
So to be a whole architecture discussion, right? Because he basically tell C Star import first and then this is a second smaller event with the smaller payload you need.

**Jennifer | 54:31**
Yeah. And I just wanted to bring up and make sure that there was nothing I was missing. That needed a bigger architecture, but I'm pretty sure it's just going to be an event catch and then send it to a different, event grid or with a different topic or something. 
If there's nothing else, then I'll put this together and then put it on the Mentalor board. Okay, so then.

**Stace | 55:04**
It is. It is blocked by the other things in progress. So you could put it on the Mentalor board now. But they could do the Azure side if they know what the payload is. But the other scouts kind of got to wait.

**Jennifer | 55:15**
Well. And DJ's doing the Azure. Yeah. So I think that we'll just have to wait until it's ready, but at least it'll be there for planning purposes. This other issue. I know we only have four minutes, but basically we are getting a large amount of exceptions on the cognito migration lambda because it's, not accounting for some of the cases that can occur in the system. 
For example, if you. If a user has both a phone number and an email address, and they try to sign in with their phone number, but their login uses their email address, it won't find the phone number in the first pool, so it'll go to the old pool, look there, and then throw an exception because it's not there. Technically, we don't need those exceptions because we're like we are not expecting all of the users to be there, anymore. 
So but instead of going and changing all of the errors and exceptions, I feel like a faster way Is going to just be tearing down the cognito migration. Lambda and the old pool. I looked at the number of users that it said in the cognitive the old pool, and based on it's under a thousand dollars. 
Like it's 800 dollars to migrate all of the users. But most of them would probably. I don't know if all of them have orders or not, so we would have to see if all of them need to get migrated or not. 
But I feel like the time that it would take to fix the exceptions on something that we're going to eventually tear down, it might just be worth it to just tear it down now and do the migration of those users.

**Stace | 57:16**
Didn't we already like agree to this a few weeks ago?

**Jennifer | 57:19**
We agree.

**Stace | 57:20**
I actually thought with these last releases that it was that. STR.

**Jennifer | 57:27**
Yeah, no, we pivoted away from it because of the solution that we found. It didn't need it, and so we just wanted to keep it simple and not do it. But now like, it is needed again. So, yeah. Okay. Okay. They will put this in. The last thing is actually really quick as well, but just because. 
Okay, this one is just, something I'm gonna add to the sprint teams. I just wanted everyone to, like, see that we were adding it. This has been talked about many times and it's a monthly review of any of the dependencies and upgrades that are needed. 
So putting that in here I'll post or I have the ticket posted in the chat. If anybody has anything else to add into this or make sure that I covered, feel free to message and I'll update it.

**Sam Hatoum | 58:37**
One thing we didn't cover at all today. Maybe we should do another interim session, which is the impact versus like likelihood risk assessment we did, and there was a bunch of stuff we thought we'd bring into this group. Do you just do that on Tuesday next week at the regular schedule? Have that as a priority for the. 
Yeah, just to make sure we're not like that we put any, remedies in now. Alright, cool. All sounds goods.

