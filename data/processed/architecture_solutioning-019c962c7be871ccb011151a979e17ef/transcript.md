# Architecture Solutioning - Feb, 25

# Transcript
**Sam Hatoum | 00:43**
How are you? I think it's a good start. I just came out of a session of how do we automate the user experience and information architecture using agents. This is for auto. And so like we've got this process that you give it a prompt and then it has to come up with what is the right user journey, what is the information architecture, what to present to the user, all of that stuff before it gets into implementation. 
Because if you just go straight into implement implementation, you get crap if you take these thinking steps first, trying to like structure it. Anyway, that was a two and a half hour intense session. Now into this one. 
So [Laughter] burning the calories, that's for sure.

**Wesley Donaldson | 01:32**
This will be intense.

**Sam Hatoum | 01:48**
He. So it looks like I need to catch up on some of the things. Hey, Antonio. Hey, Dane.

**Stace | 01:54**
Hey guys, good afternoon. Let's it go that here so I guess we would wait for Jennifer. Let me kind of set the stage easy so this high level right, [Laughter] so simplified. But what I mean the goal here is this next step we're after right as the entire team is focused on being able to leverage the recurrly API so that we can place an order within their system. Now you got to get the order out of the system. [Laughter] Yeah, which will involve event Bridge and web hooks to pull it into the drive. Now we have a working example of that today. 
You know where we have Shopify hanging out? Here in Event Bridge, there's a LLaMA that gets a bunch of data from Shopify, passes it through a stream. Actually, I think this ends up being technically a rest call between the two services. Event Bridge. Which is? Event Gra. 
Sorry over here on the Azure side right, which is their copy of Event Bridge. And then we have another application that processes the data coming in, stores it through various methods into C Star and we persist the order and C Star DB. 
So while that's an example, I don't want to. I think the first or the one thing I would throw out there is probably being a non negotiable is I don't want to build on what we built for Shopify. Fact I don't want to touch it, right? I want to let it hang out. I want to take zero chance of breaking it. 
And when we're off shop with FI, I just want to be able to delete it with zero risk of impacting anything else. [Laughter] So it might mean that I think there's like a Kubernetes cluster here. If we have to fork it, if we have to duplicate it, if you're copying the LLaMA because there's a transform, we want to say that's fine. Let's not mixy matchy between what we're going to throw away from Shopify and what we want to keep forever and recurring. The other thing the Shopify flow doesn't have, it's not forward thinking at all, right? It was just met in a scrappy way. For how do we aggregate enough data on Shopify to Shoehorn in order and to C Star, right? 
And I think when you want to think about recurring a little differently, right is I want to focus on the Thrive way of interacting with re curly and what we're keeping long term and then stitch on. Okay, now drive has the order. Let's emit some sort of a bat and transform it into C Star. I'd rather see Star be the afterthought, not the guiding force in the architecture which it was in this example up here. Does that all make sense so far? 
Right? So here's where I think for the purpose of this call, we need to dig into like, what does this look like in our event source or our world, right? Again, this got really messy because we really tried to make Shopify work like CSTAR. 
And so this code here is listening to a web hook making lots of pause, or Shopify aggregating a bunch of data. It's brittle at bast, right? Which? Which again, I don't want to repeat. So that's why I think we leave it alone. We currently has all kinds of Webb subscriptions, and they all do unique things. Some of them we care about, some of them we don't. Actually, most of them in some form, we are going to care about over time. 
And I'd like to at least start with the challenge of. Rather than one long, procedural, messy piece of code that's easy to break. That's like listening for everything and trying to do everything. Do we just want to be super granular? Does each of these events just have a lambda that listens to it? That LLaMA gets the relevant data and stashes it into current, right? 
And then we project that in the forms that we care about. So we're not trying to do all this programmatic aggregation or we get, you know, we get the envoys paid. And that really has to call three or four MVOYS to aggregate the data. 
Like that's kind of what I want to talk about is can we keep it really clean where there's just a bunch of Lando listeners within Event Bridge that go get the data that they care about, store it and everything's put together and distributed through like events and projections.

**Sam Hatoum | 06:55**
Yes.

**Stace | 06:56**
And that's where we have to build. How do we make this something real? [Laughter].

**Speaker 4 | 07:03**
Yeah, in case of recording, we may need to use the API gateway because they don't have an event Bridge integration.

**Stace | 07:14**
Okay, yeah, maybe. Okay, great point.

**Speaker 4 | 07:21**
So we just have one EP gateway and we can just maybe think about formatting the message if we care about that and just sending that to COR.

**Stace | 07:34**
Yeah, so I guess technically these are sort of out here. [Laughter].

**Sam Hatoum | 07:38**
I would look at all the things coming in to from re curly. Like there's two ways we can handle this. I think one we can set up an API gateway that receives all of these events and then has our own internal representation, which is a mirror of these events. We just store them as is. We don't transform them or anything so that we don't lose any data. That way, if we ever want to go back and do something. 
And, you know, we forgot to, pluck a specific field. At least we have everything, right? So it should be cheap. I don't think it would be expensive to store all these messages coming in. Like, how many orders do we expect to happen per year, for example, per month.

**Stace | 08:18**
20 30000?

**Sam Hatoum | 08:20**
Okay, so you know, 30. Sorry, is that per month or per year?

**Stace | 08:25**
That's per month.

**Sam Hatoum | 08:26**
Isn't it? Okay, all right, so thirty thousand per month. Like, we're looking at maybe, half a million a year. And then plus all the other types of events that you get around them. Let's say there's like five to ten events, so, you know, we're looking like a few million. 
Like that's not a lot of event.

**Stace | 08:42**
Not bad. And I kind of like that thought too, because then it makes updates really easy, right? It's just a new version of the same about something out of order changes.

**Sam Hatoum | 08:51**
And I think current will do a great job.

**Jennifer | 08:53**
Like that too.

**Sam Hatoum | 08:54**
Just because. Because then you get the first order of events that come in. The first order come in as just as their rule. And we can do second order events. So we can then have transforms or we can have like, you know, anything else we want to do separately. 
Because with Domain Driven design and all these sort of concepts, you have this concept of an anti corruption layer, which is the data comes in and it's not our shape, it's not our domain, it's not our words, right? Where they call it subscription. We might call it something else, like, you know, a paint plant. 
Yeah, so but so we can take it as it is and store it. And that's just that's our storage of the events that came in. We can probably go get it from them anyway, but it's nice just to have them in our domain, in our world. 
Sorry. Now we can do the anti corruption layer, translate them to something else. So Antonio, keep me honest here, like, if you've got any additional thoughts on this, like, please jump, please do jump in. 
But that's my first thought is like log everything and then have a second order of translating them, because that way we can just. That's an API gateway dedicated to just receiving them and nothing else.

**Stace | 09:53**
All right. I love it. And then this is future thought. But I think this fits very well in. What you're saying too is right. There will be examples in the future of things that may need to go the other way, like a participant updates information about themselves or about their subscription in the portal. 
Right? We'll see that event stream change and then want to call recurrently and update sync there.

**Sam Hatoum | 10:20**
Yeah, so then you know we have an anti corruption layer on our side. We don't just consume these events as they are. That's a big no. And the reason is because you just changed from Shopify to Recurate a year down the line, you might there might do something new and the business will say we need to shift again, in which case we'll just take those events from that new system, whatever it is, right? 
And then we'll have our anti corruption layer do the work of making sure it's not corrupting our domain. We keep a clean domain on our side of what an order is and everything else. And in that middle layer is just taking care of the translation as they come in.

**Stace | 10:58**
All right, no, I like that. And that handles. So essentially then these streams are going to look like well, they are going to be mirrors of recuurly stream. So then if we want to say, I want to pull certain information out of an order and that becomes part of a Purchaipant stream or profile, we're going to rip all the diagnostics out. That might become part of like a fulfillment object, right? Then those are all projections exactly.

**Sam Hatoum | 11:23**
Yeah, exactly. Like, I think we're going to get two things. One is we get the anti corruption layer that goes into Thrive in terms of orders and so on and what have you. That's great. And we from there, we can do a bunch of projections. 
I think if you ever, you know, realize that you need something new, you could potentially there's nothing stopping you from doing projections directly from the raw stream. We could, but I think we just take it as a case by case. I'd say the default should be that we project from our domain. We don't project from the external domain like the default should be.

**Stace | 11:50**
No, I love it. And then that's that solves the CTAR transform problem too, right? We just say. C Star needs these. Whatever they are. 50. We project that into kind of a C Star projection or object, and that's what goes over the wire to that.

**Sam Hatoum | 12:04**
Yeah. And for CSTAR, you can make a choice. Now you can go straight from the raw stream to CSTAR because effectively that is itself an anti corruption layer to C Star from the raw events.

**Stace | 12:13**
Okay, I like that too. You can go. So we're done with CSTAR, you just cut that off and again, no chance of breaking anything else, right? You're like drive exactly.

**Sam Hatoum | 12:23**
Webb so then yeah, like the events coming in get bifurcated into both CSTAR and us it is the same source of truth. Unless there's something specifically you want that we are precalculating on Thrive that you do want to go to CSTAR in which case they can feed off of BU both are okay.

**Stace | 12:38**
Yeah, there might be some things they might be aware, right? Like, there are some derived statuses C Star expects that we like again, the nomenclature won't match from recurring order to that. Like, we probably will to do some something.

**Jennifer | 12:53**
But we'll have like that translation from, like, Recurate to C Star, which is like that, and it's gonna be just different than the one that goes into Thrive.

**Sam Hatoum | 13:04**
Yeah, I think. Yeah.

**Jennifer | 13:05**
Okay.

**Stace | 13:05**
And like dreams going to Thrive, right? So then essentially you're just doing your like a connector and a projection, right?

**Wesley Donaldson | 13:08**
There's two. Line. There.

**Stace | 13:11**
It's like here's a set of data that we're going to that CTAR can go get.

**Sam Hatoum | 13:16**
So I can you repeat that last part?

**Stace | 13:18**
STA so the trance does the transform happen like in the projection?

**Sam Hatoum | 13:24**
No. So I wouldn't call this projection. I'd call this more like an anti corruption layer. Like so as the.

**Jennifer | 13:32**
You can you have a picture of one that we talked about before with an anti corruption layer.

**Sam Hatoum | 13:40**
Can you send me that mirror? I'll just right now together.

**Stace | 13:45**
It's in the chat.

**Sam Hatoum | 13:46**
Its in the chat. Thank you. Any thoughts Antonio?

**Stace | 13:55**
Not I believe that ACL is a really good call for distribution. Really is okay. No, I like that too. My other concern was I thought I was worried if we just were to wing it on this and not think about how we want to get the data and to Thrive first, we ended up with two services like the Legacy service and Thrive, both deep diving into recurrly to get things. 
And I see that as just being messy and brittle and problematic to right we're here. If there's only one, that one, API gateway, we're bringing everything, and I feel it's very safe, right? And then that gives us the true strangler pattern rights. We're not. There's nothing really mixing matching between what we want to keep in the Thrive world and continue to build off of, and nothing to do with the Legacy world or how EAs Star wants to look. 
Yeah, rocks that code.

**Sam Hatoum | 14:49**
I do wonder whether we want to do blue green here. Like just like it like it's not us necessarily Thrive but it's using our same infrastructure. So it's just that we can have the safety of things. So like we could, you know, when we talk about Thrive, we talk about the Thrive domain, but then when we talk about the Mono repo, this is where we have our infrastructure, right? 
And so we have a lot of good stuff. Blue, green and things like that. So I don't want to mix and match the twos. If I'm saying Blu Green, it doesn't necessarily mean we're saying drive. I'm working to the left, by the way. A little bit of you there. 
I've just got this little board that I'm trying to put on.

**Stace | 15:24**
Yeah, I think there's some flexibility there and some. Like Jennifer has some thoughts based on the old code depending on speed. I mean, if I had it totally my way, I just think, right, you get the data Thrive needs and you put it over to Wire to Azure and all of the complexity there. I'd loved nothing about that. Transformed to really be in a AR mono repo. May not be that way, may not be how we accomplish it.

**Sam Hatoum | 15:51**
But I mean, it's doable.

**Stace | 15:53**
Like. I mean.

**Jennifer | 15:53**
The big thing about having it in ours versus theirs, like it's just like we've got a lot of like the logging and we've got our same alerting and so some of those other things that we just have set up rather than putting it in. 
Okay, but well.

**Stace | 16:10**
You see the asterisk there and I know we're fixing it is. Yeah, monitoring logging, alerting actually works on the Azure side and it's been problematic for us on the.

**Jennifer | 16:20**
Good point actually.

**Stace | 16:25**
But hopefully we're on that too. So, yeah, as long as. As long as we can remove it when we're done with it easily, then I'm good with it.

**Jennifer | 16:34**
Yeah. And we already have it for the Shopify stuff too.

**Speaker 6 | 16:37**
Yeah. So are we envisioning that the Ceasar order land is going to pipe directly into API one or API two for ECOM on the right hand?

**Jennifer | 16:49**
So we're going to get ECOM three, okay? And I don't want to do any update like ECOM three needs to match ECOM two exactly.

**Speaker 6 | 17:03**
So ca I think on the Azure side, there's still kind of like a hop skip and a jump. There's like.

**Stace | 17:10**
I's yeah.

**Speaker 6 | 17:13**
There's a event grid, but there's sworn there was, there's something else that was triggering. I was catching the triggering, I guess a post the event grid, right? And then I think a lot of that is unnecessary, especially if we set up a dead letter here off the Lamba.

**Stace | 17:31**
Yeah, I think it's a chance to clean that up. Plus in I guess in three there will be some major refactoring we're going to have to do to kind of maneuver. Because what we want to do pretty quickly after this happy path works is to be able to take the individual diagnostics and not insert them into C Star as the packaduct, right, but just as a to big C Star essentially just become a bucket of all card orders really for the purpose of. 
Right, it's just that the right tests have to be performed in the field of FSA.

**Speaker 6 | 18:11**
I mean, that would definitely simplify things in ECOM, right? But yeah, and Thrive. ECOM but I guess that true challenge is going to be down in the field, right? How do they quantify what they're doing as far as like just messaging back to the participants on site at the day of the screening? 
But we noticed you got all of these diagnostics right? But there's probably something going on there in interaction with treating VIP guests differently because they have membership or explaining the nature of the membership, just noticing that it's on their order, things like that.

**Stace | 18:46**
Yeah, no good points, right? Yeah, we would have to preserve some sort of are there one like number or not some data like that.

**Sam Hatoum | 18:58**
Yes. So I presented a couple of options while you were chatting away about that. Just, these are the two. Like, I think we've just got to make a choice here between which way to go for Thrive versus C Star. 
So the top one is just bifurcate and the bottom one is serial. So like everything comes into the Thrive first and then it goes into a c store. And the only reason you choose the second one that like the first one should be the default if we can, but the second one you only do if there's some specific transform we're doing on our side that matters to CSTAR. Hopefully not.

**Jennifer | 19:29**
I don't think so, and I'd rather not do that way. I like the first one better.

**Stace | 19:34**
I like the first one better too. The. As long as the connector which I think it can I that the trick with CSTAR would be like if we really listen to all the individual recurly events, there might be something in what we have because C stars just purely transactional, right? There's. It has no concept of eventual consistency. It might need to wait for two or three things to flow into that connector before we can push it as a completed object or completed order into C Star.

**Jennifer | 20:08**
Is there like an event that we know is like the last event that would come in like order completed or something like that?

**Stace | 20:17**
You're going to have to ask recurrently that. But again, what I want to avoid is what we had all those hoops we had to jump through with Shopify, right? Is.

**Jennifer | 20:25**
Well. And in Shopify there was not that. And they even said it might be like. Like you. You have no expectation of timing with any of that. Which is what II don't remember.

**Stace | 20:37**
From the C maybe Dane does. I think you work on this side. I think it was like invoice paid that sort of tied up in the order. Yeah.

**Speaker 6 | 20:45**
I'm pretty sure it's that magic number seven there on our list on the left. Because as long as we know what type of invoice it is, right? It's not one of the. I guess the subscription related invoices. All the necessary things like your account and I guess parent account your customer related demographic data, right? The billing and all that stuff is already it's already set in stone and recuurly it's necessary to get to an invoice. 
And those would be all the things that we'd need on the C Star side for that transaction.

**Stace | 21:18**
Yeah. And then like two through five, we'll just be keeping mostly, like, statuses in sync. Did your membership lapse? Was it canceled? Yeah, we need all that kind of stuff and then we'll act on it appropriately for entitlements.

**Sam Hatoum | 21:46**
A is that right? Alright, so what else do we need to cover then? To get to a good point here, if you wanted the Thrive to work the thiveway, that would be the ACL comes in, which is our anti corruption layer so that we can not be polluted by external events. We now have clean events internally here, which are Thrive events. Projections come in and they project the data into Aurora, which we can then leverage wherever we need to. 
And that way you have the up to date. Yeah, simple like that. That was the whole simple pipeline we were talking about the other day. Yeah, you need to be this simple and, you know, this can be like a complex data store over here, like with relationships and all sorts, you know, like the sequer relationships, et cetera. 
So we can do joins and what have you. And then over on this side we expose with the graph.

**Stace | 22:38**
In this model. And I'm just asking a question for my own. Aware this just from a pure future scalability thing. We technically don't have to keep the ACL layer forever, right?

**Wesley Donaldson | 22:56**
2.

**Stace | 22:56**
So if you think about once the screening is passed and an order becomes immutable, like if I want to only keep that for a year or two, you could throw that away but still have the rest. That, like the aggregated data or not.

**Sam Hatoum | 23:07**
The ACL lives as long as you have a live connection coming in from the external data source, right? Like so, for example. So the.

**Stace | 23:14**
It's a business like ours. I don't have to keep it for like ten years. Right once the order is done.

**Sam Hatoum | 23:21**
No, what I'm saying sorry, is it's transforming the feed of data. So I just elaborate a little bit on what's happening. You get subscription created and inside of that you're going to have, subscriber ID, right? 
And it's gonna be before. But Thrive has no concept of subscriber ID it has participant ID, right? So we're always gonna be translating the anti islating what is a different domain concept and parameters and nomenclature in the external world to our nomenclature. 
So long as we have a connection with the outside world, we'll always be doing this translation.

**Stace | 23:56**
All right. So? So. I was think it's not the streams of raw data.

**Sam Hatoum | 24:03**
So sorry that I missed the first half. What was that?

**Stace | 24:06**
So it's a translation layer, not a story, correct?

**Sam Hatoum | 24:09**
It's a translation exactly. It's not kind of thing all right.

**Stace | 24:11**
You know, that makes sense. I was thinking about it wrong. Okay, sorry.

**Jennifer | 24:14**
Seem you were saying like let's save some of the raw data that comes in and that's what we're saying like, we don't have to save that super long term.

**Sam Hatoum | 24:25**
I see. Well, I mean, there'll be I'm just saying but make current like you don't have to it's there for audit really more than anything. Like you could what's it? You could purge them if you want to. You can purge them at some point.

**Stace | 24:38**
Okay, yeah, won't be a.

**Sam Hatoum | 24:40**
Probably the okay, you don't have cabbage. All sorts of comment like we definitely don't have to live for forever. Yeah and then like then that way we've got the fencing current projections they go to AA we have the graph that because to use users and you know who consumers of the data I don't care what happens in C stars not my publish.

**Stace | 25:13**
Yeah hopefully we didn't care more six or eight months either. Yeah.

**Sam Hatoum | 25:18**
Like, I was going to ask, like, what's the lifetime there? So it's gonna go to CSTAR for, is it for safety? Like, what what's going on? Actually, let's just talk about like, let me help me understand. Why does it have to go to CSTAR at all? 
Yeah, let's just stop there. Why does it have to go to see.

**Stace | 25:33**
In the short term? So let's think about a couple of reasons. So right now, we're just moving sales from e com. So representation. And it has to be there for the order interface that the call center is today, right? Until we can get them and to Thrive then like in terms of editing the order and what the order looks like doesn't matter at all. CR and we can do our financial reporting out of Thrive, but we still haven't replatformed the field service application yet. 
And what you order populates the tests that need to be delivered to that field service application. So yeah, when I said when I. So that's kind of the nuance that does this help make sense to you to think ahead is once we can get call center, once we can stop sales and orders from being placed in CSTAR, the only thing that really needs to end up in CTAR is, hey, if I bought a annual screening and a silver package, right? That entitles me to twelve diagnostics. Somehow those twelve diagnostics need to end up in FSA so that when I show up at the screening, they know, you know, what tests to perform on me. 
And if I have blood work, what order codes to send to the lab.

**Sam Hatoum | 26:57**
Yeah, I mean, what's what we're saying here is like now the graph needs to like as we grow this. That's what you want to happen? Yeah, like basically all the consumer app, the call center, the f SA if it's all feeding off of that graph and the mutations come back, you know, through to the right side of the system then that you're saying that we need CTAR because these guys are not ready yet, right? 
So until these guys are going to be done, then we still need them in C Star. Is that the answer back?

**Stace | 27:23**
That's exactly it.

**Sam Hatoum | 27:29**
So we're just gonna go.

**Stace | 27:30**
We can get to the top two, right? Our goal is when we say the Commerce project is really to be able to get those out. You know, our target date would be could we do this by the end of June? I mean, once you have that simplifies things a lot. 
And that opens up a whole lot of the business value to. That is right. All the complications about the products and services we offer, how we price them, how we want to sell them, how we bundle them. 
That's gone from Legacy. It's all living and Thrive. Plus, if you think about what's still causing us a whole bunch of pain in the result in the participant portal and resulting world, it's making sense of all these orders coming from CSTAR once we can consume the orders directly and Thrive, resulting them gets a whole lot easier too.

**Speaker 6 | 28:23**
So I'm down for DCOM and cooling. It's time to go. Yeah.

**Sam Hatoum | 28:33**
So I'm just highlighting here just a separation of concerns with CQRS, but just it's going to be a little bit difficult to represent it, but I will. So if we imagine that all these queries are going this way and then all the mutations are gonna go this way, right? 
Like from the from various things. Then we get into the other part of separate that I'll color code them in a second, but I just want to make sure everyone knows, like how we're gonna make this as easy as possible as a transition going forward. 
So if we color code the. I don't know. Pink that way. So you can see the queries going out that way as green and the mutations coming back this way. Well, what we'd have now, instead of the projections, we'd basically have our deciders and all the mutations go through our deciders this way, which then end up backing current and there's your loop. Makes sense. 
Yeah, that's it. That's basically our engine, right? Like you want something new, create projection, you want something new, create Decider you want a new query, create a new query. Like everything in its bright spot, that's what we've been aiming for from the beginning. 
And we're really close. So, yeah, I'm super happy to see this. 
To continue color coding because my OCD's screaming at me right now. 
Okay, what else do you need to answer as part of the sessions? This.

**Stace | 30:20**
Jennifer, does this get us close enough?

**Jennifer | 30:24**
Okay, yeah, this is great.

**Stace | 30:33**
Yeah. So depending on how things go, I mean, they may be with the next couple days or next week, right as we get closer to sort of the MVP of being able to place the order and recur. AI think you have a lot of people in that small footprint. We can probably move on to starting to stand up this basic happy path infrastructure and get the API gateway going. Start listening to events from Recurate that ACL, the current layer.

**Jennifer | 31:04**
Dane, you've been kind of wrapping up some of your stuff from the Mandalor team, right?

**Speaker 6 | 31:11**
Yep, mostly taken.

**Stace | 31:13**
I've been seeing.

**Jennifer | 31:14**
You pick up stuff. Yeah. So this could be something that we could get you started on.

**Stace | 31:22**
And then figure out what it's going to take, right? If we are going to fork or make e comms free again, think about that, right? Yeah, my reason for not just wanting to. Unless you can come back and say no issue at all. What I what would just be a very painful spot for us in the business right now is if we're doing a bunch of work to make Recurate get into CSTAR. 
And somehow we broke Shopify through that release path, right? And then we're left with nothing. And we get stuck in a fixed loop. Rather than a migration loop.

**Jennifer | 31:58**
Yeah, and I'd like the first like this first release where we want everything to be just like Shopify, like we really shouldn't have any reason to change anything with the Azure. But as you had said, Stace, like as we need to add stuff on, we may end up needing to change stuff as it starts separating more from Shopify. 
And so that's why I think your idea of having that ECOM three would help us.

**Stace | 32:24**
Right? And then it wouldn't be three to maintain for all that long, right? Because you could shut the shop. I went down once. All the traffic's off shop by and we're back to two. Exactly.

**Jennifer | 32:33**
And we could probably name it ECOM recuurly instead of three because I hate the numbers, but that's just me.

**Sam Hatoum | 32:43**
Cool. I spoke to Wez and Antonio about getting our first like, Emmet installation here. Because I think we've got to do all this stuff here with Emmet. We have to get. So our first slide, I'm. I'm not sure if you've already spoken about this to the rest of the team. Was has that been presented to.

**Wesley Donaldson | 33:00**
We mentioned it as an item that we wanted to do for commerce, and Tony is already. And Tony already has it as an next item once he gets through just some smaller tasks the cleanu stuff. 
So we're probably.

**Sam Hatoum | 33:13**
Great.

**Wesley Donaldson | 33:13**
He's probably tackling it. Starting next week.

**Sam Hatoum | 33:16**
Okay. So FAIRBROONE's knowledge, what that is creating the patterns that we're looking at here. So Emmet is a event driven event sourcing framework, a very good one, and it's been it's evolved a lot in the last year. 
And, yeah, it helps us, like, have a pattern for doing the different lines, their projections, deciders, et cetera. It's got all of those there. So Antonio and it's going to give us the first slice of that.

**Wesley Donaldson | 33:39**
[Laughter].

**Sam Hatoum | 33:40**
Get it. Get a hello world, which does a quicker re mutation implemented in the pipeline first, and then that gives us the platform for us to start building everything on top of it, which is this recurring stuff. 
So it's sped like. Iteration zero of emit. If you like.

**Speaker 6 | 34:00**
That's right, yeah.

**Sam Hatoum | 34:05**
And what else we got for today?

**Wesley Donaldson | 34:11**
Do you. Any other alum? I had.

**Sam Hatoum | 34:13**
Twenty five.

**Stace | 34:13**
That's it for me, unless there was something else outstanding blocking the team. Jennifer I think.

**Jennifer | 34:19**
That was the main thing to go through. I mean, we have like little things, but I don't think anything that needs to be talked about at this point.

**Wesley Donaldson | 34:29**
The only optional thing we had was, a little bit more conversation around Emmett.

**Sam Hatoum | 34:35**
EMMITTT sure. What do you want to know? Who wants to know it? I mean, I've the first thing I'll do is just send you, like what it is. So, this is actually the, I'll post it in our chat architecture solutioning. This is Emmet. The documentation is actively being worked on. I'm helping Oscar build the documentation, so I'll give you the latest site so you can look at something a bit richer. This is a pull request that's open, but hopefully we'll get that in soon. It has much more up to date documentation, so if you want to read about it, that's the place to go. 
And you can read on the left. There's a whole bunch of stuff around projections and things like that. The other interesting one that's being formed right now is Workflows multi step workflows. That's actually something that's going to be useful for us at Stace. 
So if I share my screen a second here screen, there it is. Yeah, there's this whole concept of workflows where you can basically have, like, you know, a sequence of things that need to happen. So that's in the. 
And I know we'll need that for sure. So it's kind of extends the decider pattern, but it says like, how are you going to have a workflow? And you can recover and have durability from workflows as well. 
So, you know, these are the sorts of things we can get into, as we go on. But just have a read at those docs that I sent over. Yeah.

**Stace | 36:08**
I think it's good on this call. Familiarize themselves with that. And I kind of like, as we're rolling into this pattern. I think when you and I talked, Sam, we thought a good way to ease into this. You could a little bit be by division of labor, right? We have a couple of people that are responsible for the pattern of getting things into that flow in the connectors and the current expose it to the graph and the rest of the team can work temporarily on the other side. 
And slowly we'll let we'll shift people left. I suppose it would be.

**Sam Hatoum | 36:41**
If I just extend that a little bit like the pipeline really is this it's, you know, deciders come first, projections come next, and then queries come after that, right like that. And then of course, there's on the other side, there's the UI and so now if you look at that like most people should be able to do this. Pretty much everybody today should be able to just like write a projection that takes events and put it into a database that's, you know, known quantity queries. Everyone can write a GRAPHQL resolver that can talk to a bunch of data sources, bring back data and that's that should be fairly trivial. You is obviously that's what we do all day long. This is the tough one. This is the only place where there's a bit of like, you know, domain knowledge when it comes to event sourcing and things like that. 
And I think as people are more and more interested, they can come and do that. So yeah, like division of labor like that's it. Now we can have these things happen in parallel through contracts.

**Stace | 37:30**
Okay. Yeah. And I think again, just learning so far we've got a couple of areas, but I think I am I thinking about this right then between the deciders and the projections, is it an area where visibility is really important because if anything goes wrong or that can't happen, we need to know right away.

**Sam Hatoum | 37:49**
Yeah, exactly.

**Stace | 37:51**
As well as some other stuff. I like what you touched on this morning, right? Other event streams with dead letter queues. How do we get visibility on that just so we can react quickly? Because I do think right, we've had some stability problems there. 
I mean, the good news is they would have all been small problems had we caught them within like 30min to an hour. The only problem is we're not catching them. So they become big problems that are weeks long, right? 
So if we can catch them, they'll all stay tiny problems, and in most cases, unnoticeable, right? We'll have it fixed before the side effects could be seen.

**Sam Hatoum | 38:28**
It's just the alerting problem. Yeah. Do we? We spoke about having. Sentry at one point. And it doesn't matter whether it's century something else. But I was speaking to Wez about this the idea of turn the signal to noise ratio like the signal to noise to the max to the on the noise side. 
So now everybody's bugged by the noise.

**Stace | 38:51**
So everything got century on the connectors, right?

**Sam Hatoum | 38:55**
Yeah, I think so. I think so.

**Wesley Donaldson | 38:57**
We have it on the graph. I don't think we have it on the connect.

**Speaker 4 | 38:59**
We have.

**Wesley Donaldson | 39:00**
The next one was on the Event Store.

**Speaker 4 | 39:02**
Okay, we have century, yeah, the graph and the lambs.

**Sam Hatoum | 39:08**
What I'm saying is like let's.

**Wesley Donaldson | 39:09**
Hey.

**Sam Hatoum | 39:09**
Because Sentry is pretty good at muting and like dealing with the noise, right? That's why I like Sentry. I don't know if any tool other tools can do that, but the idea principle is turn the noise to the max, right? 
And now have every day one person on rotation, like different people, you know, throughout like one, week two, week three. Their job for every single day is to go look at the noise and see if there's any signal, and otherwise the job is to reduce the noise. 
So put a practice in if it's, too bad logging. Remove the bad logging. If it's exceptions not being caught, catch them if it's something we need to ignore. Click Ignore in Sentry and this way the noise is on the max. 
But like, we're consciously turning down the actual noise and letting the signal come through. What we have today is the opposite. What we have is this signal, and we're trying to pick up the signal. 
And that's very different to getting everything. And then. Tuning down. The noise. You see what I'm saying?

**Stace | 40:00**
Yeah, no, I agree 100%, right? And if we tune down the noise, then there's help, right? It doesn't only have to be developers going, I've got other cloud ops people if they can't react to everything because they won't understand all the code level warnings, right? 
But if we tell them what to react to, then we can have 2047 response. They can be hovering to make sure things get done, notifying the business. All the fun things that need to happen.

**Sam Hatoum | 40:31**
Because if you turn up all the noise for them, they'll do is just send it all back to you. Right?

**Stace | 40:35**
Yeah. Right. If. Yeah. They're getting an alert every hour. Then we get bothered every hour.

**Sam Hatoum | 40:41**
Where do you have your hand up?

**Wesley Donaldson | 40:43**
Yes, two things on this one short term versus long term. I think long term we agree Century is the right solution. I think we've deprioritized the additional instrumentation around the rest of the application so only have the graph as we mentioned. 
So I think prioritization wise, we intentionally chose to focus the team on commerce rather than focusing the team on the additional instrumentation for Century one two. What are we doing in the short term? I connected with me how as the person who is just giving him the credit has really been there for us to help identify some of these issues and help us track events. 
So I spoke with him, I think, this morning or yesterday about like, being that person for us, that kind of listen out, but more importantly, like, be able to train up the next person to take on that role. 
So he's part of his responsibility, yes. Playwright but watching out of these events and then documenting how the methodology uses to watch out for them. And then I'm bringing my intention is to bring that back to the larger team and having become like our process for monitoring these events beyond just waiting for it to show up in teams.

**Stace | 41:48**
Okay. Yeah, I think that's our priority. But with that said, then the stuff we're doing for Commerce, which is pretty light and Thrive right now other than kind of the graph connector, right? Make sure that's implemented in Century. 
And what Sam, you just showed that new path decision makers. Let's just get that right as they roll out and then as a refactor stuff and go back to revisit the drive architecture that's driving EP.

**Wesley Donaldson | 42:13**
Two three.

**Stace | 42:21**
We can continue to instrument and make that better over time, but let's get the Commerce stuff right with the right signals noise ratio and then because let's just make that part of the release requirement. Let's just get it instrumented and get it out. Agree?

**Sam Hatoum | 42:40**
One one thing I would change about your plan there was is, rather than put it squarely on me how I think have me how spend one week and then just force the rotation every week for somebody else to be taken care of that like it's too easy to centralize and for every other developer to say that's not my problem. 
I think we actively, consciously have to make this everybody's problem, and the only way to do that is by having it. You're on this rotation this week. Like you're on log logs and noise duty. You're gonna spend two hours a week or a day, whatever it is like one hour a day. Two hours a week. We can come up with a number with the team of what makes sense, but, you know, just have that on a weekly basis. 
So this week you're working on it. Here's your document. Go make something useful. Reduce the noise. Next week. You're off duty. Now you're on duty. That's how I'd do it. Yeah.

**Wesley Donaldson | 43:30**
And that is the plan. Sorry, I apologize and provide more detail, but the goal for me how for and he owes it to me for Monday or Tuesday of next week is to go to prepare what that looks like. He's gonna walk me through it as the crash test dummy. I'm gonna give them feedback because if I can do it, anyone, any of the other engineers can do it. Not to hate on myself, but the expectation is we'll rotate through it, learn from it, revolve it, and then hopefully Century will bring much of that resolution to us through the intelligent monitoring or intelligent learning.

**Sam Hatoum | 44:00**
Awesome, thank you. Alright, does everyone get 15min back? Was there anything else?

**Stace | 44:06**
Yeah, I think it's good. I don't think I drew this through one before, but if Emmet's named after Dr Emmett Brown, I like it better.

**Sam Hatoum | 44:14**
It is because it's back to. That's right. Yeah, you should read like Oscar's a Wealth of Information. Let me just, like, show you his event Driveventa Io blog. Like anyone who wants to learn. I've learned a lot from Oscar. He's just he's a prolific wri proliferic writer of the chat. 
So here this is his blog. He does a bunch of talks and things. But. Yeah, check it out. Okay, all right, thank you all until next time I'm around if anyone needs anything.

**Stace | 44:46**
Now, that's good. Thanks all.

**Speaker 6 | 44:49**
See you.

**Stace | 44:49**
Guys by guys.

