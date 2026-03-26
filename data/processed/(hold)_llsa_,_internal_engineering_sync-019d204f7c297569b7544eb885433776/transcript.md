# (Hold) LLSA , Internal Engineering Sync - Mar, 24

# Transcript
**Wesley Donaldson | 00:04**
Good morning.

**Michal Kawka | 00:04**
Good. Mart.

**Sam Hatoum | 00:06**
How's it going?

**Wesley Donaldson | 00:08**
Pretty good.
I was just on the phone with Antonio, so I know he'll be joining momentarily.

**Sam Hatoum | 00:23**
Okay.

**Wesley Donaldson | 00:30**
Jivko, Sam. I'm not sure if you saw my message yesterday, but Jivko has jury duty this morning. So he may not be able to join.

**Sam Hatoum | 00:36**
Yeah. Okay, S.

**Wesley Donaldson | 00:55**
I just picked Antonio.
I think that's everyone.

**Sam Hatoum | 02:09**
Okay.

**Wesley Donaldson | 02:10**
Yet.

**Sam Hatoum | 02:10**
Hey, all right, cool. Well, thanks for coming over and for a quick sync. The purpose of this is just so I can know how I can be of help. What is the exact state of things? This week we really got to light up that state of integration diagram. Green. I want to make sure that you guys are enabled, that if I need to pair with you on anything that I make the time.
So just a quick sync on the next few days. I don't want to take too much time. That's really the purpose here. Let's start with... How what you're working on towards that diagram? If you are... How can I help if it'll...

**Michal Kawka | 02:52**
I haven't started working on the things from the diagram yet, so yesterday I picked up a task about the Jesus chat, so I'm still blocked on the configuration, so... Rob is working on that. That is coordinating.
So in the meantime, I picked up another task from the board, which is... Let me tell you what that is, because I don't know the name by heart.

**Wesley Donaldson | 03:17**
Is that trapping?

**Michal Kawka | 03:17**
It's the tracking tag with recurring commerce flow. So...

**Sam Hatoum | 03:24**
Okay, I don't think that's the next one that makes sense. I think the next one is good. This is why we have these sessions. I think the next one is... Given that Antonio has moved Antonio to work on another task, we've left a bit of a hole now. I can't see the diagram doing from memory, but the left side the infrastructure blue, green, etc.
So I think that makes more sense because that lights up the diagram unless anyone else objects.

**Wesley Donaldson | 03:47**
About... So the blue-green stuff that should actually be in a good place. I would love to get you to be a part of that, but Jeffco has already worked through that. He was pairing with Francis yesterday to get this to a good place.
So I think most of this should already be there. You just need to connect with Jeffco to confirm the end status. But from the conversation, it looks like they have the production blue-green already set up. The domain names are set up as well, so this should be able to turn green today.

**Sam Hatoum | 04:22**
Okay, if that's the case, then... Just beyond support then to make sure that goes green. If we're saying that goes green today, is Git code done?

**Wesley Donaldson | 04:27**
[Laughter].

**Sam Hatoum | 04:29**
Is there any outstanding work
from the development point of view? That's what we want to do. So the game here is just to go left or right as green as possible. We've got Recurley. Antonio has proved that we can get webhooks on the dev environment from Recurley into the API gateway and then into the hands all the way.
That's all that blue stuff all the way up to the SQS and then the next thing. All of that is already running in dev environments. So there was a bit of work to get it to Prague with DNS names, whatever, blah.
Please have a look at that and just get us to a point where you can come and validate and say that is green. Because if that's green and prod, then, you know, we're. We're ready to start taking web, like events from, recuy right now.
Me how are you good with that?

**Michal Kawka | 05:26**
It makes perfect sense. Yeah.

**Sam Hatoum | 05:27**
Cool, so... Okay, it's awesome. So, Antonio, let's have a chat about this new package call logic or whatever you want to call it. The single EM instance. How are you doing? Aside from being called in phone calls by me and by Wesley and everybody else and all of that.

**Antônio Falcão Jr | 05:44**
Hey, Tim, I have a clear vision on this work, and I have a good plan and execution plan in place already to run it. I'm about to start making the code changes. I will be testing it to the end of today and sharing the PR with the team for review.
Yeah, it's clear and it's clean and it's simple. I can say it's not that complicated. Actually, we are more so... We are more simplifying stuff than we had before. So, yeah, I'll let you guys know if I need anything else, but I'm good.

**Sam Hatoum | 06:29**
How are you? How much are you using Claude versus handwriting?

**Antônio Falcão Jr | 06:35**
I'm using Claude a lot. Yeah, to make the analysis, to help me set up the plan, and to help me write the code as well. So Claude is my good partner.

**Wesley Donaldson | 06:45**
Zero.

**Antônio Falcão Jr | 06:47**
[Laughter].

**Sam Hatoum | 06:48**
Cool, good. If anyone needs any... If either of you wants to have a... How to use Claude in any way to be more effective, I'm happy to join. But if that interrupts you, then I'd rather not.
So let me know.

**Wesley Donaldson | 07:06**
I want to... We have one more epic that I think...

**Sam Hatoum | 07:07**
Absolutely.

**Wesley Donaldson | 07:11**
Miha. I'm going to assume that we'll get to a really good place really quickly on the blue-green if we do. What I think would be very helpful is for you to jump in on the BI work.
I think that could be a quick win for us because... Christian was very appreciative of us reaching out and trying to push this forward. Not having it be a last-minute thing. So I think there's an opportunity to have a good win there.
So for this, we have direction from them of what they actually want us to track. So we now know specific KPIs if this is just creating projections. Tony, as we talked about, we have a ticket for just building out all what those projections are.
If this is something we... How you can take with the direction here as well as the work that Tony has already done, this could be definitely a Claude session. But we have enough raw detail for us to be able to run this, I think, pretty quickly.

**Sam Hatoum | 08:03**
We got... I think we've got to wait on that. Sorry, because the work that Antonio is doing is actually simplifying that, and it's going to be rolling in the projections that happen as connectors.

**Wesley Donaldson | 08:10**
People...

**Sam Hatoum | 08:14**
I mean, you tell me, Antonio, if this is the right scope.

**Wesley Donaldson | 08:14**
You know, yeah.

**Sam Hatoum | 08:16**
This is a good conversation.
I know you're putting it all into a single process, but are we going to stop the old re-model, the connectors to the re-models that we did previously? Are you going to cover that as part of the scope? The current re-models are updated. The BI is updated by the work AMI did, which is a connector that comes out of current that then runs projections and... Inj pushes them straight into Aurora. We're about to do something very similar, and we spoke about unifying the domain model. The sorry, the data model.
So does that mean that the work that was happening in the connectors is included in your work to unify into a single core app or are you going to keep that separate?

**Antônio Falcão Jr | 09:10**
I think it was a question for me, right?

**Sam Hatoum | 09:12**
That was a question for you? Yeah.

**Antônio Falcão Jr | 09:16**
No, these scope the scope is not considering unifying the projection model yet.

**Sam Hatoum | 09:24**
Yeah, okay, cool. So those projections that we have for BI from Christian are those additions to the current read model, the current BI read model, or are they new things?

**Antônio Falcão Jr | 09:38**
They are new things separated. Projections models, yeah.

**Sam Hatoum | 09:47**
Is it? Did it all new, like historical data integration?

**Antônio Falcão Jr | 09:51**
I'm sorry, to avoid confusion, I don't know from the BI side if they want brand new modules. Yeah, what we have now are new ones, but it's not BI, it's not well aligned with BI yet. We still interact with BI resources. You can correct me if I'm not mistaken, but this is a work in progress to understand what they need and then set up a model that handles their needs.

**Wesley Donaldson | 10:19**
So this is what they need as described to us. We did say on the call that we expect that we're not trying to break anything that exists now.

**Antônio Falcão Jr | 10:22**
Okay.

**Wesley Donaldson | 10:26**
So we would be creating new projections if there's an opportunity for us to update a projection and have, let's say, a source field to separate between recursively and Shopify. We didn't come to that decision. What we did say was we didn't want to impact Shopify, so we'd be creating projections for them.

**Sam Hatoum | 10:43**
Okay. So let's just be careful about the nomenclature, because it's easy to start fanning out things that we don't want to fan out. One thing I spoke to Antonio about is that we have today one Aurora database, and it has a bunch of data inside it.
That is what powers BI. So we have different... When we say projections, really what we're saying is we are building a data model. Okay, now what I'd like to do is make sure we build a single unified data model that powers everything.
So any event that comes in updates that model and that single model. So you see, I unified it right there, right into any bot application concerns for USIC, facing concerns, call center concerns, business intelligence concerns, all of them will go into a single data model. Which means we need to design it carefully. We don't want to have randomized projections going all over. We have a unified data model.
The reason we do that is now because we don't want to be writing our projections in different ways for different needs. Now somebody says, "Hey, I want to update my orders." Then we have one projection that updates the orders in one way and another projection that's lagging because nobody touched it.
So we end up in a data model that looks different depending on who's consuming it. Then people will be like, "Wait a minute, isn't this the same source of truth?" And they'll be like, "Well, we have different projections for them."
That's going to piss a lot of people off who don't like it. It's basically a high element of surprise. So the best thing to do, actually, is to just project everything into a single, well-thought-through data model that serves everybody and therefore it's a single source of consumption for the data.

**Wesley Donaldson | 12:17**
To give me everything just...

**Sam Hatoum | 12:25**
And if we need to reproject it, no problem at all. If we've made mistakes, no problem. It's malleable, we can fix it, but. And you know, we can keep evolving it with project with those set projections.

**Wesley Donaldson | 12:33**
With those might highlight...

**Sam Hatoum | 12:34**
I just wanted to highlight, not to think like we're just going to serve different projections for different consumption. It's not that every endpoint will have a projection. It's that all projections sync into a database, and then that database is a source for everybody.

**Antônio Falcão Jr | 12:49**
Makes sense. I have a question.

**Wesley Donaldson | 12:49**
I have a question.

**Antônio Falcão Jr | 12:51**
Do you see this integrated module more as a document or as tables because we have order and line items? We are supposed to end up having two tables to handle that. Do you prefer to have a document because Emmett can handle both on top of Aurora?

**Sam Hatoum | 13:16**
Nice. Okay, it doesn't matter. I mean, I think whichever makes sense for consumption, and then I mean, if you say object, when you say document, we're talking about JSON blobs in...

**Wesley Donaldson | 13:20**
Is for consumption and. And not a method.

**Antônio Falcão Jr | 13:29**
It's... Yeah, that's correct. Yeah, it goes up. Yeah, because this nested... I see the line item as a nested document inside that order. So as a single document, it makes more sense to me rather than multiple tables to handle that relationship because you end up eventually we're going to have at least three tables looking to a traditional or relational structure, like one for order, another one for items, and the third one for membership at least.
But as a single document we can have all of them.

**Sam Hatoum | 14:08**
So. And it doesn't affect our ability and it doesn't affect our ability to query the data we can still query all the same. Just like a joint.

**Antônio Falcão Jr | 14:17**
The library we are using now allows us to create a document structure, but let me better analyze that just to map impact.

**Wesley Donaldson | 14:26**
Sorry to drop.

**Sam Hatoum | 14:31**
So then to answer the question back, I think that's a really good question.

