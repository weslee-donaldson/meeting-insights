# 02:00 PM - LLSA, Recurly Order Architecture - Mar, 02

# Transcript
**Wesley Donaldson | 00:15**
That's basically... What is this?
No.
More information?

**Antônio Falcão Jr | 01:22**
Hello, team. Good afternoon.

**Wesley Donaldson | 01:25**
Happy to Antonio.
I am not 100% certain if Sam will be able to make this. He did ask for the invite, so let's maybe give him another minute or so, see if he's able to join. Yep. There he goes.

**Sam Hatoum | 01:54**
He...

**Wesley Donaldson | 01:55**
Hello. That's all. I'm happy to start by sharing my screen, but I suspect probably it's better if Antonio... For you to take the lead in presenting the moment.

**Sam Hatoum | 02:09**
I'm an fly on the wall. I'm just going to be here and listen in like you guys.

**Wesley Donaldson | 02:12**
Nice, correct.

**Sam Hatoum | 02:13**
You guys go for it, and then at the... I'll save all my things for the end unless you have a specific question for me.

**Stace | 02:20**
Playing the same role, just you guys drive. If there are any questions on context or how this evolves through our business use cases, I'm just here to chime in.

**Wesley Donaldson | 02:31**
Okay. So my hope and goal for this session was more of a collaborative... Works share mostly for architects, technical folks. Technical leads to talk through what is necessary for us to action this implementation, this architecture, this approach of how we're going to pull in recurrently specific events and recurrently specific quarter information and then transition it to our system.
I think the great conversation last week around what this architecture needs to look like, who's supposed to be able to interact with this architecture? We're already in the process of working through. We had agreed Emmett was going to be how we're going to manage these events, and Emmett has functionality that helps us with the ACLS as well. The deciders. Antonio is actively working on that. That work continues.
I think my concern is I want to get ahead of building out the epics associated with the implementation. These do not necessarily require deep product insight. They're mostly implementation epics, so to that...
Took an initial passage just... And again, not sacred here. Feel free to scrap these. Took an initial passage just what are the core steps within the flow? Wanted to open the conversation, really looking for Antonio, Elvis, Sam, for you guys to take the lead on. Here are the core phases we want to tackle. I took a couple of stabs at what the core tasks might be within this phase or goals within this phase. I see someone did something similar over here. Where did it go?
Yeah, someone did something similar over here. Thank you. Wanted to open the floor for this conversation around... Do we think these are right? Whoever created this artifact? If you can talk us through your thinking behind it...

**Antônio Falcão Jr | 04:34**
Sorry, was double-mooted. Yeah, I did some breakdown on a few tasks. It's more a suggestion on how we can tackle this and we can make some adjustments as we understand. But for this first epic, the ingestion infrastructure, I was thinking about a few tasks to address this like... Set up the gateway endpoints blue-green to pass through the recurly webhooks and have a Lambda to validate the signature and configure curly webhooks to the subscriptions we are looking for. Then that letter to be more reliable as possible. While we are consuming on this a CL and some observability with Sentry.
So the definition of done for these I would expect to be able to send and test webhooks from recurly and see the raw event in our event store. This one I believe is blocking. We need to implement this first epic to enable some part... A lot of work. The next epic would be able to run in parallel with the... The second and the third would be able to be split between multiple engineers. In my opinion, the second one is more related to the CL layer itself. Here we need to take a closer look at our domain language and make sure that we are doing a proper translation to our linguistic boundary, I would say, and define the events.
So the first one is to build the CL layer. The second one is to define the events. Then we can build project projections to our current Aurora database related to order products, subscriptions, or any other projection that may be interesting to today's WS or reports. Then expose those via GraphQL well, and once again set up some observability using Krisp and logging.
So the definition of done up. The second one, in my opinion, would be good to... From the webhook to the domain events. Then see the projections be created via these anti-cohopion layer transformations you guys can mention. Feel free to help me, whatever you guys want.
So the third is the C story connector, a temporary bridge, right? As we discussed, so we could build this separated C story connector reading from our event store. Then, the CL will be transformed that information to be complied with core.
Then we with this setup to connect our econ recursively to Azure handling any kind of ordering concerns. Then once again that letter to be made more reliable. My expectation for the third one would be from the webhook. Deliver may not be the best word, but deliver and send this order to ECOM in the proper format based on our ACL transformation.
The last one would be the C story refinement. So the ACL import I can read sor data from our graph API. The orders can be read from the drive graph API as well. Mutations can go via the Krisp using our event source patterns.
We can once again verify both consumers of the core and delete the first three entirely. So at this level, I would expect our consumers to read from our store and the connector can be deleted so Shopify and C-star code remains intact. Besides, then some adjustments we can do. I believe this plan can cover this work pretty well. What do you guys think?

**Wesley Donaldson | 09:46**
I think one thing I'd love to spend a little bit of time on after we get to a good sense of if this approach is valid, just talking a little bit about parization. How can we go to have multiple engineer services?

**Antônio Falcão Jr | 10:04**
Yeah, I had some notes on this one. Yeah, the phase one blocks everything in the first epic, but the second and the third can be done in parallel.
For sure, the phase the last epic requires the second and the third to be completed, to be at least stable, to be tested. We can start the fourth in parallel as well, but it may be blocked in the end to be completed.
So the best approach would be phase one, then phase two and three in parallel. I mean, epic one, then epic two and three in parallel, then epic four. My suggestion...

**yoelvis.mulen@llsa.com | 10:52**
Yeah, I think some of the features that we are showing, for example, in Epic one are like things that we can do that we can combine, for example, the Sentry instrumentation and the LLaMA and things like that.

**Wesley Donaldson | 11:07**
Thoughts on the initial task breakdown.

**yoelvis.mulen@llsa.com | 11:43**
The LLaMA and the century are like... We are just creating a LLaMA now with Sentry.
So that's why the foul is going to work. The rest of the thing is like I think the what I would do quickly is to get to have a proof of concept of how the integration works. What is the payload that we receive from recording?
Once we understand that, we can have a clearer idea because when what I saw is that Recouli is not sending the whole event with all the information, they are just sending an event that something happened.
But we need to query Recouli using that event information to gather even more information than the one that is actually useful. And that was in the best practices that they shared. So I would say that creating the webhook with API gateway to get the information from re-recording, understanding what we get and how we can get the rest of the information...
So we can then ingest that into the system. Would be the first step that one developer would have to do.

**Wesley Donaldson | 13:08**
One thing I want to call out around the century instrumentation, the Lambda, and correct if I'm wrong, and the Lambda, all that really does for you is effectively allow you to see events to get insight into what's going on inside of that particular LLaMA. We need to talk about what the output of that is so great we have stuff coming in. What's the reporting look like in Century? What are the events that we need to create if we want to push something to teams or not?
I think that needs to be a conversation as well.

**yoelvis.mulen@llsa.com | 13:41**
Yeah, pretty much. Now we are just sending it to Sentry. So we may want to do more than that, but so far we are sending the errors that are happening in the Lambda through Sentry. Then 100 errors, especially if an error is handled and things like that, we are not sending that one.

**Wesley Donaldson | 14:04**
We need to do logging stuff, right?

**yoelvis.mulen@llsa.com | 14:05**
So senty sentry is basically just a A grupper that it's like it's a rupper line because you can it's like you pass the handler the LLaMA handler, you pass the you use the a higher order function that centri provides that is grab lam lambda and it's gonna instrument the lambda to ten there or to century just that.

**Wesley Donaldson | 14:05**
BI there's no home.

**yoelvis.mulen@llsa.com | 14:33**
But yeah, we can just create a more structural way and define what are the kind of errors that we want to report and things like that.

**Wesley Donaldson | 14:45**
Stays. Can you go down to the part where it talks to how we're integrating into Cstar? The admin-specific... Anything you see here stays in our initial thinking.

**Stace | 14:59**
No, I think it'll work. I think sequentially, this is in the right order. I do feel that a few of these upper tasks, as you guys are called out, are necessary first before we can then act on that fork to Cstar and the ACL. I'll point out it's not already obvious, right? Our domain and our design language within Thrive will be different from what Cstar's going to expect.
That's okay, right? We don't want to necessarily model the Thrive border object off of Cstar.

**Sam Hatoum | 15:42**
So...

**Stace | 15:45**
So I guess just throwing it out there, right? Don't those should be separate tasks and separate definitions? As we grab the orders from recurring, I think you were right that the concept of vendor consistency for us is...
Okay, again, I'll point out there are just a couple of patterns that not to follow. If we do look at the Shopify code because that was being ingested directly into Cstar, we're jumping through a lot of hooks and doing multiple queries and aggregating and doing some batching stuff that just shouldn't be necessary here. We should be grabbing... They're going to notify us of a change in order to change at a time. We should be grabbing each of those individually, not trying to grab big blobs of data and iterate through them.
That's all in the best practices document. Does that make sense? Does that answer the question you were asking?

**Wesley Donaldson | 16:49**
Yes, that answers.

**Stace | 16:59**
What is...

**Sam Hatoum | 17:02**
What is a surface area here of different developers working on this look like in your mind, Antonio? Is this all you...? Is this a bunch of people? How are you thinking about it there?

**Antônio Falcão Jr | 17:15**
I'm sorry, Sam, can you...?

**Sam Hatoum | 17:16**
Sure. Like how many developers? Do you think this is this like you working on it? Or do you think that would be farming out some of this work to other devs? Or what's your thinking?

**Antônio Falcão Jr | 17:26**
I think two developers would be appropriate for this work, given that we cannot parallelize all the four epics at the same time. So sure.

**Sam Hatoum | 17:39**
Cool. Okay. I think with some of the AI work we've been doing together... I think quite a lot of this can be done, as I'm looking at it, a fair bit can be done, I think, with the ChatGPT technique.
So that's why I'm asking. Do you have in mind...? I mean definitely, do you have in mind who the other developer would be?

**Antônio Falcão Jr | 18:05**
Not specifically... Maybe Mihao would be a good guess.

**Sam Hatoum | 18:10**
Very cool. So alright, cool. So maybe Mihao and Jiffco. But, yeah, I think if we get together, put this in a big catch-up plan, I think we can... It'll surprise you how much we can do because you've got so much clarity.
It's all about the clarity of the intent. If you've got the clarity, then you know we can get really far. You've got here. So that's why I'm looking at this. I'm like, "This is great raw material to go in."
Okay, I mean from my perspective, I think it's a solid plan, just well done, great job. I think from an execution point of view, we can... Once we agree that all of this is good and I agree... I just mean the end of this session then I think what we should do is just follow up session with Antonio, me, and whoever else wants to be building this. We can have watchers if you want.
We can record the video and send it to others. But I really think we can knock out a significant amount of this with some AI magic on Claude.

**Stace | 19:14**
Code in remarks don't...

**Wesley Donaldson | 19:21**
This is a little further on the line.

**Stace | 19:23**
I'm sorry, finish your thought wasn't.

**Wesley Donaldson | 19:24**
Sorry, this is further on the line, but I just want to make sure we're at least aware of it. I think Stacey, you'd mentioned a few meetings. I'm not sure if it was last week or not, but what does BI look like down the line? How can we make sure that the business has transparency into what's going on from an order perspective? Since we're doing these projections now, do we want to have those conversations now? Who is the best person to talk to about those? Is that something we want to punt until we're a little further on the implementation line?

**Stace | 19:50**
You read my mind. I was looking at the document for line 7, right? Build the ACL translation library. Recursively. Domain to Thrive domain. How close does that have to be to write for that not to be a blocker?
I think you were going exactly where my head was going. As we haven't... I've had some conversations internally between Beth and Christian. I nominated Christian internally to represent what lifeline data model or data requirement is for these objects.
But what we haven't finalized is what... At least within Thrive World and Streams, what is the relationship between participant stream orders, appointments, and how do appointments align with screening?
Then how does that eventually break down into fulfillment? Which diagnostics are associated with an order? Historically, the business has always run on a one-to-one relationship where there can only be one order per screening visit per person, which has caused a lot of difficulties and I think especially in the recurring world.
Right? If there's a situation where someone buys a general package online, they might get a call from one of our customer service agents and upsold into a different package.
So then that's going to be a second invoice, right? It's associated with that screening. They may go to the screening and add something else, which could be a third invoice. So I think in our new world, you're going to have potentially multiple orders that then get associated with a single visit.
We actually want that visit, an appointment, to live outside of the order in this world because when it was combined with the order, it caused all these problems. We actually have to... We're mutating the order just because someone wanted to change their appointment from 9 am to 1 pm. Right? Or that should just be a mapping.
Anyway, this is my long thing. How much of that conversation do we want to have? Should I begin to tee those up in the next couple of days to decide what model we need to project this forward? Or does it not matter right away? We're just going to grab all the data from recurle. Stash it.
We can do this later.
Makes sense. I mean, how much do you want me to tee up those conversations? Maybe we do another one of these with Christian tomorrow or Wednesday. Or do you want to get farther ahead on the work and store everything and then decide how it's going to look, what we're naming things, and stuff?

**Sam Hatoum | 22:53**
I think BI should be a primary input into the process. So I think it's fine for the team to continue. If there's new input, get that as soon as possible. Okay, just because you know whether we act immediately or not. As far as different...
But the sooner it's available, the sooner we can know what to do with it.

**Stace | 23:11**
Alright, that makes sense. We'll get that going.

**Sam Hatoum | 23:21**
Well, great plan, Antonio. So what else do we want to get out of the session today? Very detailed, which is why I love it because now I can feed it to AI, so I'm eager to get into that. We can talk about that now. Now, if you want as well... Guys, I was there just five minutes left.

**Wesley Donaldson | 23:38**
Yeah, and we have five minutes left, by all means.

**Sam Hatoum | 23:42**
Okay, then. I mean, the simple thing is now, if you can, some of these things require thinking, right? For example, defining domain events. I think definitely the AI can help here, but that's not clarity of thought yet.
We don't have a full specs sheet. If you like that, we can give it to an AI to do. However, something like Sentry SDK integrates into Lambda absolutely. This is a known quantity. So I think one of the maybe the columns that you can put on this, Antonio, is which one of these tasks requires more human exploration.
That could be with a... Of course, you can help us. That's not a problem. The point is, which one is spec complete, so to speak? The more that you show that spec complete on here, the more that we can define it as a spec for to be implemented by Claude.
So that's been my experience. I think if we can get some clarity on that now, that would be helpful because then we're like, "Okay, well, let's get all the stuff that requires more human thinking done with workshops or individuals working or whatever. We need to do to get that done."
Then once we have that, I think my idea would be... My wishful thinking here is that every epic is effectively a single Claude project plan that can execute. So what do we need to do if we work backwards from that? What do we need? Or we need clarity and we need specifications.
And you know, for that, we just need to make sure everything's a known quantity first.

**Wesley Donaldson | 25:08**
One question on Antonio, how does the epic work, which we are we're planning and doing kind of quasi hello world.

**Antônio Falcão Jr | 25:09**
That makes sense. Yeah.

**Wesley Donaldson | 25:15**
How much does that work? Already in progress.
And how much does it inform the kind of epic number one.

**Antônio Falcão Jr | 25:30**
Let me see, let me think a second. I don't think they are strongly related. Do you mean the work we are doing now based on the patterns, right to accommodate a design?

**Wesley Donaldson | 25:48**
Exactly.

**Antônio Falcão Jr | 25:50**
Yeah. This is a CL. It's more... I believe the pattern we accommodate more regular use cases, business use cases like require mutations, just normalization and so on for sure. For some of those operations here, we may use Xolv as a way to do more about to have it part of our design, but in general, it's more about using the library as a standard more than applying the patterns here. I believe because this is an CL, it's more about working more as a component.
It's complementary to our application. It's not something that we share the same verticalized principles that we need for business rules in my understanding. But yeah, it's really good. Question in general, it's going to support for sure. We will end up having handlers, message consumers, and projectors either way.
So yeah, the design will help us guide us on this implementation as well.

**Sam Hatoum | 27:09**
Yeah.

**Wesley Donaldson | 27:11**
Okay, I guess... I guess more for... I guess Sam and yourself. What inputs do we need? Once you've gone through that initial... I don't want to say PC where we've gone through that hello world and that demonstrates the patterns and stuff. Is it just more like a checkbox? Yes. These are... Do we expect feedback? Do we expect modification to that?

**Sam Hatoum | 27:35**
No, I think we're establishing the patterns. I don't think we have any unknowns, I think they're all known. So, we needed the projection, we needed a command handler to event recording in the current.
Then from recording being recorded from event being recorded in the current to a projection that leads to a remodel update. Then to show that we can have a graph resolver that can talk to those read models and retrieve data and push it out to users. That was the initial groundwork, the "hello world" that we're talking about. This stuff here is just building on top of all of that.
So it's not like we have anything to prove here. It's not like there's... It's all known quantities. We know exactly what we want to get out of it. But it was step one, just get the "hello world" on. Step two, layer on all the complexity.
So it's more like a scaffold than it is a spike. We're scaffolding the target system. So yeah, that's it.

**Wesley Donaldson | 28:26**
Cool, yeah, I think this is clear. Antonio, I can take the first passage just... You've already done that, so maybe I can just...
I'll take what you have here. I'll create the epics for us, and you can help me distill them down. I'll create some rough scaffoldings and tickets. Again, if you can just take a look through... Make sure we have just enough that we need to give that clarity. Love the idea of... Let's make this a Claude ketchup.
So solve... I think my suggestion would be if we could maybe... I know we have... You're thinking of me... Maybe we can have a member of... They say... Maybe Jeremy or Lance or whomever can be partners. More of a learning opportunity there. I'm not sure how in-depth they are with ChatGPT yet.

**Sam Hatoum | 29:09**
Yeah, whoever wants that's what I was saying earlier. Could we have a member of... Let's have it as a working session, but then others can join with an audience. All right, so we can have an internal webcast, so to speak.
So agree with that too.

**Wesley Donaldson | 29:25**
Cool. All right, you got a good 30 seconds back, everyone, except for more in the next meeting, guys.

**Sam Hatoum | 29:29**
Thanks, great, but now you just took up the 30 seconds. Thanks, ma'am. All right, see you guys.

