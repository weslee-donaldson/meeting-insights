# Mandalore, State of Integration Review - Mar, 13

# Transcript
**Sam Hatoum | 01:03**
Integration diagram, more distinct diagrams, link on Miro if you want to come here. So what I'd like to do is... Can you all hear me? Okay, by the way, just one more question. Yes, okay, because I just switched microphones.
All right, I'll show my screen and we can get into it. A last state of integration. Here we go. So we have some previous plans, but I'm going to just start with... Let's see. No, I'm going to start a fresh one. It won't take us long, but it gets everyone on the same page pretty quickly as any frame.
I'll bring anyone who's on the board to me. Okay. So we've got Rinor on this side and events are coming into our event store like they're going to come into Lambda actually first, and then from here, they'll go into our event store.
So the state of integration diagram says that business users are going to be entering... OOP. Excuse me. Wrong thing, wrong button. We're going to have business users entering packages in here.
Just go on your package packages, configuration, etc., okay? Then we're going to get through that system, through the Lambda, through the current... We're going to get our orders.
So let's just start building up the picture of all the things we've got to build. All right, so the idea of this diagram is... If it's in red, it's not started. If it's blue, it's in progress. If it's green, it's already done.
So we can say this is already done at the very least, right? Because we know we have current in place, we don't have infrastructure to build. This is a complete piece. Just make the rest the same green. OOPs, these are not...
So we don't have a Lambda right now that ingests anything from Rinor that's all red. Please correct me if I'm wrong as I put this out. So which means we don't... These lines are very important because sometimes people can build a Lambda, but they haven't integrated it anywhere and therefore it's pointless, right?
So that's why it's called state of integration, because the actual lines in between are super important. So we don't have this going on right now. None of that's configured. We don't have right now business users going in there configuring stuff yet.
Okay, so you can see it at a snapshot. I can look at this diagram and see where things are missing and what we need to pay strong attention to.

**Wesley Donaldson | 03:52**
The. The second.

**Sam Hatoum | 03:54**
That's really the purpose of this exercise. It's going to help us gamify the integration.
All right, so let's keep going. What else have we got here? I know a lot of it, but I want to ensure that everybody else knows a lot of it. So what happens next?

**harry.dennen@llsa.com | 04:16**
I mean, are we feeding back into CSTAR?

**lance.fallon@llsa.com | 04:21**
Yeah, we'd have to map it to the shopify API and send you an event.

**Sam Hatoum | 04:27**
I'm going to put my headphones back on and go to the... Very well.

**Stace | 04:31**
Actually, let's... Can we stay left a little bit and just get the recurring to thrive part right and then layer on CSTAR and whichever way it's...

**Sam Hatoum | 04:53**
Where are we doing the ACL? Is that the Lambda or after the current?

**Stace | 04:57**
Yeah. Because this isn't... Why can I not find this document?

**Sam Hatoum | 05:02**
It's the state of integration one. It's the normal one, so showing up in my... At one time it's up here. That's where it is. I just said it again, I think you...

**Wesley Donaldson | 05:14**
I...

**Sam Hatoum | 05:16**
Okay, so yeah, the ACL is going to happen as a separate step over here, so we'll do the current eco so this is the raw event coming in.
If I just say this here... These are webhooks. Then what we'll...

**Stace | 05:53**
Well, don't we have this right? This should be deployed or deploying now because we just demo right for the store. Don't we have a graph who stood something up here and a Lambda that talks to recursively?

**Sam Hatoum | 06:08**
Yeah, do we have that right now?

**Stace | 06:10**
You do.

**lance.fallon@llsa.com | 06:14**
The ADA was encompassed by the first two green blocks.

**Stace | 06:18**
But they're separate Lambdas, right? So I want to see them in our diagram as separate Lambdas.

**Sam Hatoum | 06:27**
Yeah, of course, we're going to give them names as well. Absolutely. You are correct. So if I just put the graph over here because it's client-facing, so I'm going to make this a left-to-right diagram.

**Stace | 06:46**
A minimum of three things we have to play there.

**Sam Hatoum | 06:48**
Okay, so that's good. This is exactly what we want to do and make sure this happens. So, Krisp goes into a Lambda which hits our SQS, then triggers another Lambda which basically will go fetch from recursively and then it will hit current with AI. At this point, this is the ACL then, in that case, well, two things it does, actually. It records two things into current.
So let me just actually cut that out and put that over here. It would go this way, right? We'd have the Lambda
is going to update our models, right? This is just I'm just going to say data model. Alright. So then the graph talks to that. So this is where the graph lives, and the graph consumes if it needs to. It can consume data from here. Likewise, it can consume data from here to... Somebody just did this steal route, right?
That's going to fetch stuff from Krisp. So we're saying this exists, this LLaMA right now that talks straight to any.

**Stace | 12:47**
What is that? Unless I misrepresented that, right? Because in the store today when you go to post the order, don't you?

**lance.fallon@llsa.com | 12:54**
We just S the.

**Stace | 12:55**
It goes back to us. Then doesn't our Lambda have the API key for Recury?

**lance.fallon@llsa.com | 13:01**
We have the graph and the graph, yeah, makes the call to Recury. Okay.

**Sam Hatoum | 13:09**
So effectively... I mean, yeah, we have a call out to Recury. So it's in the graph. I'll just separate the graph as the concept versus the Lambda that does the work. I'll just keep it there for now. But yeah, it's very simple. You're saying inside the graph itself, the resolver just runs in here. We have a resolver like Lambda into queues. It sits there. We've got DLRQS, we can get notifications of issues, and then we have a Lambda over here that then picks up from the queue, does the job of hydration.
So it's like hydrate plus a CL.

**Sam Hatoum | 13:47**
Yeah, the outcome of this Lambda that will be the domain event, right?

**Sam Hatoum | 13:52**
So both exactly. We'll store the domain event as well as logging the raw event and just putting it in the stream for debuggability.

**Speaker 6 | 14:01**
Okay, we're going to have the raw event. Okay? We're going to have the grab hook on the SQS, the raw event in the stream, and the event domain event in another stream.

**Sam Hatoum | 14:12**
Okay? Yeah. So, and let me say this. Hydrated Recury event, right? Because what we've got here is SQS is just going to basically put in these jobs effectively. What they're telling us is, "Hey, you have a job to go fetch."
So it comes here, this guy goes, "Okay, I'm going to go fetch. I got it, I hydrated." Now that I've hydrated and it still hasn't said this job has been processed to SQS it's still an open job. This is hand processing it hydration happens.
If it fails, then it goes to that three times it goes to the dead letter queue, otherwise it retries. So we have a nice retry mechanism here that keeps trying to fetch your home. Once it's actually fetched, then it needs to record it. It still hasn't said to SQS I'm done because it's trying to record it in current.
Once it records two events, it records first the raw hydrated event into current. Now we say this happened. We received this event. Then the second thing is we can say, "Here's the LS domain event." Now another way we could do this, come to think of it, is we could actually just put the raw event in the metadata as well.
That's another option we can have so we don't have two separate events, we can have just one event. When this comes in, this can actually have the raw data that's doable.

**Speaker 6 | 15:21**
Okay, what are your position options? I'm sorry.

**Stace | 15:23**
Go ahead.

**Speaker 6 | 15:24**
What about the option of having the ACL lamp?

**Wesley Donaldson | 15:26**
Increase.

**Speaker 6 | 15:28**
As a subscriber from the hydrated event is string.

**Sam Hatoum | 15:33**
We can absolutely do it, and that separates the concerns for sure. It's definitely interesting. It adds an extra hub. What are you thinking about elaborating on?

**lance.fallon@llsa.com | 15:43**
That's kind of what we're doing right now. What he has suggested.

**Speaker 6 | 15:49**
It's not about separation of concerns. We don't need to do that in terms of scale. It's not about isolating the components.

**Sam Hatoum | 15:57**
I agree. So yeah, I'm with you. I'm like I think I'll leave it as an implementation choice. I don't think it matters, but like two ways you can do still the separation of concerns. You can have these as two packages: one is a hydration package, and the other one is a CR package.
You can have modules. So you can definitely modularize it within the lander and have it as one deployment boundary. In which case, it might make sense just to then record it as a single event, and then it's just one job done.
If you didn't, then you could have this. Then we could have this event come out and come back in again, and, I mean, the latency is negligible. I wouldn't worry about that, but it's just an extra hop, that's all.

**Speaker 6 | 16:34**
Sounds good.

**Sam Hatoum | 16:35**
That's the choice. Honestly, I don't think it matters unless anyone cares more about that. Alright, so we have now the events come in, that's it. Like this subsystem works. I think it's bulletproof if we get the SQS in there, and it's putting that stuff in here like we've got a pretty bulletproof system. We have the notifications that come in here that tell us if anything goes wrong.
This notification is all the way to current. So until the message is recorded in current, the SQS delivers the letter. It's responsible for letting us know about any failures over here. So the spans from here all the way to here is this. This is how we get notifications and awareness of anything going wrong.
All right, next, let's keep going. Go ahead.

**Stace | 17:26**
No, I think this is good. I was just going to add one more note to remember. Now we're focused on new orders, which is the primary thing and what we're doing. But I think in that hydrate a CL lambda thing, right?
Another reason why I think we want to separate web books from the getters is there will be different types of events, right? So there'll be the new order event, which is the hardest one, which is what we have to do first, right?
Because that could create a new participant. There's an order that is fulfilled, and it's got to go into Krisp, and all this kind of business, but for things like membership, we're just going to get very simple events like, "Hey, a payment just occurred."

**Wesley Donaldson | 17:59**
First.

**Stace | 18:04**
Keep the membership active or membership got canceled, right? There might be no order. There's no participant to create, which is the status we're updating.
So I'm just kind of throwing it out there so people remember that there will be the different events we get from Recurly, and they will have different use cases.

**Sam Hatoum | 18:21**
That's very fair. So let me do that right here, actually. So we've got... Yeah, today we have a multitude of connectors. This connector over here, let's start naming things now. So this is the... Let's call it the Krisp connector.
Unless you tell me there's something more specific about it's connecting what event bridge event bridge to event grid. What's happening on Krisp, what's actually receiving this and doing something about it?

**lance.fallon@llsa.com | 18:43**
We have an API that will process the event offered.

**Sam Hatoum | 18:46**
Equity and does what?

**lance.fallon@llsa.com | 18:48**
Adds it to C Star.

**Sam Hatoum | 18:50**
For what purpose?

**Stace | 18:53**
Well, it has to be there for the call center. But most importantly, why we have to keep this in line is the field service application, right? When you go to the event to get screened, the order needs to exist in Krisp for it to exist in FSA.

**Sam Hatoum | 19:10**
Okay, that's it. That's what I want to say, just so people are aware of why I was thinking this.

**Stace | 19:13**
So yeah, and if it helps you think of it, basically what we're doing is we're tricking Krisp into thinking this is an order that came in through its e-com site.

**Wesley Donaldson | 19:20**
Exactly.

**Sam Hatoum | 19:23**
Okay, cool. The... And now what we're going to add here is that actually we already have. By the way, this BI already exists. So I'm just going to make these remodels, connectors, and LLaMA all of these already exist. Just really annoys me. I can't connect a bunch of stuff in Miro.
If I've connected a shape and an arrow together, I can't change the colors of the edges. You have to select them separately. So... And annoying. First of all, problems. Okay, so we've got two data models really being formed here.
So there's the BI data model, which I'll just highlight it here for now. That's actually already functioning and it's in production. So when I say green, that means running in production. Nothing else is green. You're not allowed to make something green if it's not in production.
That's the name of this game, this one here. Maybe it's the different data model, I don't know. We've got to chat about this. Is this new data model? Or do we extend the BI model? Right. In which case this becomes... Just put this as a question, right?
Because the BI model, if we extend it, then that makes it a single source of truth for the data models for all things to consume.

**harry.dennen@llsa.com | 20:33**
What do you mean, the BI model? Are you just referring to the Aurora database and the three tables we have that are the main reference?

**Sam Hatoum | 20:39**
Ray created a business intelligence, like basically a connector that goes to Aurora models hydrator like over here like a BI Lambda, I think is cool or something like that. Remodels, BI. But basically it creates... Exactly. It creates an Aurora database and it projects into entities.
Yeah, right. So now we're saying we need some entities about users. But probably... What if we... If you imagine a normalized database with the right data inside it, is there really a difference between BI and public-facing? Isn't it just a isn't the difference the query?

**harry.dennen@llsa.com | 21:14**
Yeah, no, I'm with you. I think that's what's getting at it's a read database.

**Sam Hatoum | 21:19**
Yeah, exactly. It's just a it's just, yeah.

**harry.dennen@llsa.com | 21:23**
Because there's a lot of stuff in there around the BI reports, but there are three basic tables and it's just order, screening, and participant, and maybe one more.

**Wesley Donaldson | 21:28**
The...

**harry.dennen@llsa.com | 21:33**
So I just... That's...

**Wesley Donaldson | 21:37**
Thank.

**Stace | 21:37**
I like the idea of why create complexity before it's necessary. I think it might be necessary because I do want to be sure that business intelligence is decoupled from transactions, and we could make a lot of wild changes to our system without blowing up reports.
Plus, they tend to want to look at data in a much more horizontal structure. But we can cross that bridge when we come to it. So let's read from the same table as it is. But what I would say is don't corrupt the existing participants' orders the tables having to do with results because those are fed from CSTAR, right?
So if we insert to those, there's going to be an echo. We're going to get the little ear back from CSTAR, and you're going to have a... It's a reflection, I guess, is a better pattern, right?
So we should create what we want to be the source of truth that will take over from those tables.

**Sam Hatoum | 22:32**
Switch to that data model instead. So we have a really good abstraction layer here that, from the front-end point of view, will remain the same, and where we fetch the data from doesn't matter, right?
So we already have that nice abstraction. It's just trying to highlight. Actually, we have the same abstraction on this side. So on the read side, we have an abstraction, and on the write side, we have an abstraction. We have the data models being projected here. We could project to one or two.
So we're safe. We can make a wrong choice now and correct it very easily later.

**harry.dennen@llsa.com | 23:03**
Yeah, I'm interested in this. We're getting data from Krisp into the Aurora DB.

**Wesley Donaldson | 23:12**
Yes. For. Bi.

**Sam Hatoum | 23:17**
I don't know about that. I like. Yeah. Please clarify this.
These days talking to. I stay there probably.

**harry.dennen@llsa.com | 23:41**
Yeah, just I'm just thinking, I mean, we know we have to get away from runtime projections, and we have to use the remodel in Aurora. So if there's... I didn't realize Krisp was writing into that. That seems bad if BB's writing into it as I know it is.
Well, yeah, I don't know. I'm curious if there... I actually don't know how the reports are being compiled. There are a whole bunch of PG tables.

**Sam Hatoum | 24:11**
If I just label this here so you can see where my brain's going, we have... Integrate. It's breaking tiny integrations, right? This is where Krisp is with its connectors and everything we're going out to the world.
Then over here we have data concerns that's happening, which is these guys, and that's by way of read models for BI for projections and for the internal state. Then there's another set of stuff over here that happens, which is more like... I'm just going to call it processing for now, where an event comes in.
Then we're like, "Okay, well, we have a connector now that's going to do something else, like it's going to call policies. We have a lot of these already today, like we just call them generally connectors."
But there's... They do stuff, right? They might update, create participants, and things like that. These are all the policies that we have. So these are the when-then... When an event comes in for a new user, then create a new user into Cognito.
I think they're called Cognito Connector or something like that right now. Yeah, right. So these are all our policies. Are you saying that it's just that we need a new policy that doesn't exist today for doing appointments?

**Stace | 25:28**
Well, we'll need... This is where I think about again because you have to remember that the reflection coming in. So we don't want to touch Cognito users or anything like that because they're probably not going to be created from the recurring order though. They don't get recreated until Krisp bounces the order back until no orders are coming from Krisp.
So I guess the policy... But it's going to be a little tricky in the beginning, right? Because we're going to end up having two participant streams.

**Sam Hatoum | 26:01**
So, just to highlight to everybody else what this means and to just picture it. So we have participants from Krisp, right? I guess what we have here are participant events related events from Krisp. Let's just call it that.
All right, so we have a bunch of those coming in, and from Krisp, we mean, like today, there's this weird S3-based system, right? Where it comes to S3 and then it gets picked up by... And then it makes it into current, right? That's the current mechanism that we're talking about here.
This comes in from Krisp. I guess let's just for completeness sake, this is orders or something like that, I guess is what's coming from here and then it ends up coming into our system this way, right?
So that's our integration that way. It's fine. It's served its purpose well to date well enough, and we're going to decommission this and your worry stays. Is that as we get events coming from here as well as the events coming from Rinor now that we need?

**Stace | 27:13**
As we go through the stranger pattern, right, unfortunately, both have to live until we didn't stop the call center from placing orders in CSTAR.

**Sam Hatoum | 27:22**
Yeah, so I'll just put this here duplicate events warning mechanism needed. Alright, so that's an area we need to go explore. We should do an event storm around that and figure out exactly how it happens and then make sure that we either create new policies or update existing policies or just know what to do there.
Okay, so that's the hot area that we need some discovery not this. Yeah, I need some fleshing out for sure. Then for appointments, is there something similar or is it different? Is that net new disappointment thing or is it going to suffer anything around duplications and echoes and what have you...?

**Stace | 28:06**
Well, EP is still going to read from the appointment that's embedded in the CSTAR order, and I think that's okay for a minute, but it's not going to be... There's not going to be any stories with updating appointments in this first version for what we have to release in March and April.
Okay. When you get the call center stories, there will be requirements around appointments because that's where we'll need the appointment handled outside of an order, right where I can go change my appointment from 10:00 am to 1:00 pm and that necessarily shouldn't have to involve recurring because it isn't because I haven't changed anything about the order. I'm not settling new payments. I'm just simply updating the entry and my appointment stream.

**Sam Hatoum | 28:56**
Okay. Alright. So just to highlight, to make sure I understand, we don't go through our system at all for appointments. They're going to go from Rinor somehow to CSTAR directly. So through this...

**Stace | 29:09**
Yeah, because we haven't yet provided an interface to edit the appointment, but that will be upcoming in April. Okay.

**Sam Hatoum | 29:16**
All right, okay, good. So I'll just take that out of this diagram altogether for now. Then that was one of my main concerns is that we didn't have an eye on this. But if there's not anything to keep an eye on, then all the better.
Okay. So we have one policy to take care of, which is how we make sure that the participants with new and existing and so on... I just need some fleshing out. We can set up a session for that and get it done.
Okay, anything else for...? Is this a complete picture for what we need to get done by the end of the month?

**harry.dennen@llsa.com | 30:08**
Sure, hope so.

**Sam Hatoum | 30:19**
I don't know what this looks like yet. If there's an "as resolved" on the side...

**harry.dennen@llsa.com | 30:23**
If we didn't make it to getting the reads from our data models instead of projections, that wouldn't kill us. It's not like that's not critical path.

**Sam Hatoum | 30:36**
No, they can stay there, they can stay right there. It's more a case of we've got new data coming in now, which requires new projections, and for that, we're going to use this new pipeline.
Yeah.

**harry.dennen@llsa.com | 30:47**
I see what you mean. Okay, so don't do it in trajectories. Go ahead and drop it.

**Sam Hatoum | 30:51**
Into the DBN, yeah.

**harry.dennen@llsa.com | 30:53**
RE we plan on doing anything else.

**Sam Hatoum | 30:55**
Cool because we're putting in Emmet right now to handle all this new stuff. So this gives us the opportunity to start migrating everything to Emmet as we see the pattern form. So then, going the next time somebody has to touch any projector, just factor in the time it will take to migrate over into the new projector, and then we'll get to go.
Then we can deprecate all of them that way.

**Wesley Donaldson | 31:21**
Are we recreating?

**Sam Hatoum | 31:23**
Alrightad.

**Wesley Donaldson | 31:23**
Are we creating specific projectors in the event pattern for recurring, or are we just waiting for as we make updates to existing projectors?
Because... All right, now, all the orders look like Shopify orders. By virtue of this, we're transforming them from the DTO into Shopify orders. Do we need specific projectors for recurring? Or are we just relying on... Or can we just rely on the existing projectors that service Shopify orders?

**Sam Hatoum | 31:54**
I think all projectors that are required for recurring should be done in the read model of approach. If there are any existing projection queries that are going to be overlapping, for example, let's say here participants write and how they're being resolved or how they're being solved over here.
If we touch any data that an existing projection uses, which should migrate it as part of the work, I feel like that'll be easiest. Antonio, you can keep me honest here, but I feel like if we go ahead and just put data into an entity data model, all we have to do is just go and remap the resolver that gets it from a projection to otherwise get it from this data.
Then it's that easy in my mind. I agree. Yeah, I don't think we've got... I know change normally means risk, but to me, this is the exact kind of change we want to be making because the risk is something going wrong with our projections, which we have seen.
The more we can get rid of these, we're replacing rotten wood with good new wood. So if we're building good new wood here, as we're building this building and we find a piece of rotten wood, don't keep using it. Use the good wood.
Alright, so I again, I think we can leave it as a chef's choice. When they get down into the ground, what makes the most sense. But we do have projections. They are working to a good degree.
We would like to deprecate them altogether as you touch this new stuff. Deprecate and migrate. Let's be aggressive about that so we can get rid of our projections as soon as possible, but not at the expense of saying, "Let's go through a refactor and stop the bus while we're refactoring."
That's not okay because we have a timeline. So trying to balance those two things...

**Wesley Donaldson | 33:44**
Firefox.

**Sam Hatoum | 33:47**
Okay. So yeah, we definitely need some work down here, whereas we'd love some help in facility. I'd like to be a part of this with Antonio and the business folks and whoever else needs to be involved.
Let's just make sure there's no red. The rest of this is just work. It's a known quantity. Where if you don't see a red sticky, it's an unknown quantity. I think we know exactly what we're doing.
So it's just tickets and let's get everybody cranking. But for this one right here, this is the only thing that's outstanding. Correct me if I'm wrong. It stays, but that's what I see here.

**Wesley Donaldson | 34:14**
Think he had a drop?

**Sam Hatoum | 34:17**
Had to drop.
Okay, well, let's just validate that, please. All right, any other questions from anyone else? Is this one making any sense?

**Speaker 6 | 34:34**
Hey, it looks great.

**Sam Hatoum | 34:35**
Let's get some shit done.

**Wesley Donaldson | 34:40**
Antonio, can you connect with me after this? I want to make sure we can update 1.2 to reflect any changes here from this conversation.

**Sam Hatoum | 34:51**
Alright. So one last ask from everybody: come back to this if you're working here in this area. Let's make this more complicated. Today I just did the first thing. This should be a living, breathing document. The more that we come back to this and every stand-up, I want to see this being popped up. Where are we now? We should start seeing things go green.
Nothing is nicer than coming to release day. Looking at this diagram and saying everything we know is represented here and everything we're doing is now green. I'm going to send you the State of Integration article that I wrote about this and you'll hear the history of... This is my... Yours truly, my invention.
Please have a read of this article. It won't take long, but you'll really understand the value of the state of integration. So I've used it. I used it first on a tiny small project at Nike and then it grew, and then before I knew it, I've done massive work streams with ten people, ten teams across different time zones, and it just scales. It scales really well, so have a read of this and you'll see the value of it.

**Wesley Donaldson | 35:54**
Sounds good.

**Sam Hatoum | 35:55**
In fact, I'm going to post the link right here for anyone who comes here that can know about it. Any questions? No.

**Wesley Donaldson | 36:04**
Thank you, Sam. I needed...

**Sam Hatoum | 36:05**
All right, guys, thank you. See you later. Bye. You're welcome. You have a good weekend.

**Wesley Donaldson | 36:11**
Do we can.

