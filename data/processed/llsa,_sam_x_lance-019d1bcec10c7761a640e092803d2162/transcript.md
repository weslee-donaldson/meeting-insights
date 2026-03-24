# LLSA, Sam x Lance - Mar, 23

# Transcript
**Sam Hatoum | 00:01**
Frame when talking about events, you record them, you don't emit them. A tiny little language thing, but I think it starts to change how you think about it. You don't really emit events as much as you record them as a historical record of the fact.
So something happens outside, and then we receive that into, first of all, the decider. We have to decide, always have a decision first and foremost to make. Now, if today that decision is very permissive,
and it's just saying, "Just write it as it is." There are no laws, there are no rules, there are no business invariances in rules, okay? That's the decision the decider says always, right? But it gives us an opportunity to modify those business rules.
So that's why you always have to decide of the...

**lance.fallon@llsa.com | 00:51**
So it's just it's an insensible at that point exactly.

**Sam Hatoum | 00:54**
It's a you know, it's the county clerk that's going to do all the recording. You basically just gave it instructions. He said you always record this. But I want to reserve the right in the future to change my mind.
Okay.

**lance.fallon@llsa.com | 01:10**
I noticed with Emmett, which is very... I'm new to event sourcing, so a lot of this is new anyway. But yeah, one of the first things I noticed was when we're in error, I guess it's the evolver in Emmett. I noticed that we were not...
That is not a direct representation of the entire state. You basically just have what you need to make a decision on what events to record.

**Sam Hatoum | 01:38**
Correct. That's associated.

**lance.fallon@llsa.com | 01:40**
So it's not a projection state, it's just how much do I need to make a decision? Basically.

**Sam Hatoum | 01:47**
Yeah, and that is a projection I like when I'm thinking. Well, yeah.

**lance.fallon@llsa.com | 01:50**
I guess.

**Sam Hatoum | 01:51**
Like... Yeah, like an actual projector with film going by is like... I want to zoom in on a specific part of this film. That's all I care about, but it's the whole picture that's being projected.
Events coming in is the whole picture, and I can choose where I want to zoom in. So then we've got a decider, and I have shown you this. Let me show you. I want to do this more often with people one on one, just so I can make sure everyone is fully versed in the penciling.
So I'll show you the inside pattern here. Not this one. Think before coding. I love this diagram. It explains everything. That's the decider takes in existing state and a command, and then it's an event, but that doesn't happen in isolation, right?
How does the state come in? The command comes in from you meeting graphic or mutation or whatever. Okay, fine, so that's a self-enclosed message that comes in that says "decider." But it has to happen based on some state.
Yeah, that's the evolution. That's the decided state. But then when you put it all together, it actually becomes more like this. So you get a command and you have some state, and we'll come back to that in a second. You get to decide which emits an event. Now that event is evolved using the current state, which at the beginning would be nothing, right to create some new state.
So the next time you have an event command come in and have the new state that comes in and he says, "I'm going to decide. I've got my state n plus one." Now it goes to events. The events come here, state M plus one comes in here. This event evolves it to state M plus two. Now state M plus two goes in here to decide on the next merry-round.
That's the system.

**lance.fallon@llsa.com | 03:33**
So it's like that reducer sort of...

**Sam Hatoum | 03:36**
Yeah, exactly I could reducer I'll send you this as well very informative article. It really gets into the essence of it. This article turned the whole events world upside down. It got rid of the aggregate or almost completely removed it.
So it's nice because it's functional. This is a single pure function that takes in command and state and emits an event. Easy to test. This is a pure function that takes an event and state, produces more states, and is very easy to test independently and together they bring you the overall value.

**lance.fallon@llsa.com | 04:07**
So you said it got rid of the aggregate? Yes. Does that mean that it's just the idea if they got rid of the idea of loading each event into the current state or is it...?

**Sam Hatoum | 04:27**
It's more a case of it splitting the aggregate. Whereas the aggregate before was one class. It was a stateful object where you basically evolved a state within that object.

**lance.fallon@llsa.com | 04:35**
You by all the events in that aggregate to get to a basically a bohemoth of this is every single thing.

**Sam Hatoum | 04:42**
Okay, exactly. This turns it into... It decoupled them. So instead of one aggregate having to have all the decisions as methods inside it and some uber state being built up inside it, now you have individual decisions. It decoupled it with individual evolution of state required for them, sure, and it decoupled it, made it pure functions, and so on.
So that's why once you get the CR path, then you can just stop us in the aggregate. So that's what that is. I shared that. I just shared with you this is my version of the documentation. I'm still working with Oscar to get these in there, but this is actually much richer. I wrote this with a ton of AI, but it gets into a lot more about projections and how to use them and so on. This might be slightly dated. Be careful, because this is... I did this about two months ago, and I'm going to work with Oscar to make this more robust.
But yeah, he loves it. He wants these documentation docs, but they're not quite there for him. But I just wanted to give you an extra set of docs that you can look up, okay? How can I help you with your tasks? What else can I do here to help you understand and accelerate? Where are you?
But... Your... Understanding and your fidelity... Go ahead.

**lance.fallon@llsa.com | 06:03**
I mean, I would say I'm learning event sourcing. So right now I'm just trying to understand the code that's in the repo. I'm just how it's written. It sounds like some of it may not apply now since we're moving in a slightly different direction. SLA pattern.
But I would lean into you, I guess, if you had advice on how to best tackle... Yes.

**Sam Hatoum | 06:31**
Yeah, absolutely. I think I now realize where you're at. I don't think Emmet's necessarily a good candidate for the connectors. It's either connectors or Emmet. So Emmet would be a handler that would run. It would receive a bunch of events, and then it would have a reactor that says on event to do this right?
The reactor would have its own state that it builds up. It would evolve the state and then it would react based on those but based on that state, so you now... Let's see you get an event. Let me think this through. You're getting and when the current connector starts up, all it's all you're getting is from the current is getting a new event. Get poked into it. Now, at that point...

**lance.fallon@llsa.com | 07:12**
Drive to a stream. Then, yeah, put the events off it. If you want to handle that event, you do something.

**Sam Hatoum | 07:19**
But you still that do something. It's still like if it's simple when then a connector can just send it downstream somewhere. So connectors, I think, are good just to send the events downstream for something else to handle it.
If it's just a simple case of just submitting, sending the event through, then you don't need any state. That's one thing, but then if you do need some state to make a decision, then you're going to have to build up the state from various streams.
Then Emmett comes in handy. Emmett comes in handy because it has all the helpers. Okay, so if you think of Emmett as a collection of helpers that you would use in that case. If you're trying to make a decision before you send it out, maybe it's like a...
If you imagine the connector comes in, there's some logic built into it. In the same way, when a decider comes in, we said some of them are permissive, but some of them might need state later. So I want to reserve the right to do that later.
I think even at a connector level. When the lambda comes in, if we just load up Emmett as a library and then we use that to evolve some state... If you need it before you send it downstream, that's still very valuable.

**lance.fallon@llsa.com | 08:27**
Got you.

**Sam Hatoum | 08:28**
Okay, so I don't know how much with what you're doing right now, how much of it requires any kind of evolution?

**lance.fallon@llsa.com | 08:34**
Yeah. I mean, specifically, what I'm working on now. I'm not sure it necessarily applies. It's pretty much I'm getting the event and we just have to send that event to BET. So there's not really a decision to be made on what we're doing there.

**Sam Hatoum | 08:55**
What happens if the event sending fails?

**lance.fallon@llsa.com | 09:00**
We would park the event.

**Sam Hatoum | 09:15**
So I was thinking...

**lance.fallon@llsa.com | 09:17**
Through thinking even if it fails.

**Sam Hatoum | 09:23**
Yeah, exactly. There are a few ways precisely that one is... Do you emit an event when it fails? And if you do that, is anything going to consume that event? Maybe it's just there for information for future reference versus going into a parked event, which is a bit more difficult to go and find and fish out, right?
That's another one. Emmett has the concept of durable flow workflows where it can keep trying effectively. It stays in the state, it's durable. So it's a fairly new feature in there, but it allows you to say, "Okay, this failed, but I'm going to have some retry mechanism built into it."
Then another one is putting it into a dead letter queue. Just a good old SQS dead letter queue approach. Are you voting things into the queue? I'm going to go look at the state of integration...

**lance.fallon@llsa.com | 10:17**
For this handler, no. If it fails to the other side of this before it gets to this, we do have a dead letter queue.

**Sam Hatoum | 10:34**
That's over here, right? Like so events coming from Recurley the SQS to that letter que. But that's only if we can't deal with them. Now we've dealt with them, they're in. They're in the event store, which this is current in the event store. Once they're in here, you've basically got this thing you're basically saying you know when event which event are you listening to or events.

**lance.fallon@llsa.com | 10:55**
It is order placed.

**Sam Hatoum | 11:01**
Okay, so got and that's it. Just order one, order placed, then send it over to Anchorage. Right? Okay, so this LLaMA here is we're assuming the event grid will just do its job, but potentially the failure point is here.

**lance.fallon@llsa.com | 11:21**
Yeah, correct.

**Sam Hatoum | 11:22**
And so if he fails, you see, he's putting it into parked events. Otherwise, we can it's probably good enough for now. I think it's fine. Just thinking, I mean, just thinking in my ideal state of an architecture, what would I want to? The goal is to make sure that events safely make it over to an event grid. We've got this over here. Connectors have the concept of a retry.
So when it hits your Lambda, you're going to return a status or an ACK to the connector. If you can't send it here, you're going to return a status to the connector. Are you going to say I didn't handle this? In which case the connector says, "If it's up to event one, then ten, then a thousand, and it's hitting the Lambda, the thousand if you return no from here, this will actually stop sending you events."

**lance.fallon@llsa.com | 12:22**
Yeah. So if it's a transient error... I think if I think of the event just...
If it's a transient as like a connection timeout, for instance, it looks like we'd return a status. Would you return a status in their response? But if it is not something like that, then we do just park it.
So for the transient errors, it looks like it would just... If we turn the status to a response that will retry automatically, I would assume. Yeah, just looking for...

**Sam Hatoum | 13:21**
Where we would...

**lance.fallon@llsa.com | 13:22**
We could park it then we are just... Then we're returning... Okay, I got it. Don't send it again.

**Sam Hatoum | 13:35**
Just let me look at this here and see if I can bring it up.
Yeah, that's what I thought. I'm wondering if you've looked anywhere specific that says whether you can park an event. Because I know they use persistent subscriptions under the hood, but I haven't looked at the...

**lance.fallon@llsa.com | 14:03**
What was the question? What was the question?

**Sam Hatoum | 14:08**
So if I've got a connector and a connector is calling some endpoint, right? When what? On failure... Resilience configuration of... Let's see. On failure.

