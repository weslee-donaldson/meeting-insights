# TQ, Internal - Mar, 04

# Transcript
**Dominik Lasek | 00:06**
Behave.

**Wesley Donaldson | 00:08**
Good morning again.

**Dominik Lasek | 00:12**
Yeah. How are you?

**Wesley Donaldson | 00:14**
Pretty good. I can't complain. I can't make it today to sing.

**Dominik Lasek | 00:16**
It's great.

**Wesley Donaldson | 00:21**
No worries, expect my doc to be... Yeah, I think we're pretty good here. There was a great session yesterday with Sam. Got some clear direction. I threw those into a ticket just to have it on the board for documentation's sake. Love that report. Beautiful, good conversation and Slack. I don't think it's anything we really need to dive into. I'm... I'm clear.
I think we have enough work to get us to the demo. The only thing I want to touch on is for the demo... I think I'm clear. I've asked Nicolas to basically just do not just show the document, but maybe just distill a couple of themes.
One of the themes we need to be here is the direction that we got from Florian and how we're leveraging it. And then Dom, for you, is just how you want to approach presenting the audit work as well as the report work.
That's the two big buckets. I see that you're going to share for demo, am I wrong?

**Dominik Lasek | 01:10**
Yeah, those tests harnesses and the mapping as I understand correctly, right? Yeah, actually, how can I show that? I will run those tests, I will produce the report, I will display the report, and I can just walk them through this report.

**Wesley Donaldson | 01:17**
Yeah, actually. How can I show the that, I will run those tests. I will produce the report. I will display the report and I can just walk them through this record actually, as they showed on this on the screen, there is like the, you know, the main screen that shows all tests that are currently running all of themjson file not file j JSON structure that shows, each event that actually happened in those tests.

**Dominik Lasek | 01:29**
Actually, as I showed on this, on the screens, there is like the, you know, the main screen that shows all tests that are currently running, all of them are running successfully.
And there is a info which is like the JSON file not file, but J JSON structure that shows, each events that actually happened in those tests. So actually, I can show that.

**Wesley Donaldson | 01:52**
So actually, I can show that.

**Dominik Lasek | 01:54**
I'm not sure if I should dive into the code base on the demo to show them how it's implemented.

**Wesley Donaldson | 01:54**
I'm not sure if I would... Except for one point, when Sam presented in the architecture meeting. I think that the big takeaway was the idea of how to enable modularity down the line, right?
So if you can show, "Hey, here's the input, and here's what it's generating. These things are artifacts unto themselves. Maybe it generates a file, maybe it generates a JSON object." Just cement the idea that this empowers our ability to do it as a module and be able to refine its module going forward.
I think that would be important to... Whatever you need to do to service that need because I'm not really thinking about this current code base as something that's going to be entirely used in the future for the production application.

**Dominik Lasek | 02:33**
Okay, I see. I'm a bit worried because I'm not really thinking about this current code base as something that's going to be entirely used in the future for the production application.
So it's hard to say about the module in this current code base that...

**Wesley Donaldson | 02:47**
So it's hard to say about the module in this current code base that...

**Dominik Lasek | 02:54**
Okay.

**Wesley Donaldson | 02:54**
Okay.

**Dominik Lasek | 02:54**
That's something that we will have.

**Wesley Donaldson | 02:54**
That's something that we have but yeah, for now, I can actually show them that the implementation of the test, how it's built, that it actually uses those modules and so on, that it executes the pipeline.

**Dominik Lasek | 02:58**
But yeah, for now, I can actually show them the implementation of the test, how it's built, that it actually uses those modules and so on, that it executes the pipeline.
And yeah, it produces the output like the events, like it takes input.

**Wesley Donaldson | 03:09**
And, yeah, it presents the output like the, you know, like the events, like it takes inputs.

**Dominik Lasek | 03:14**
For example, for the circuit input, it takes the circuit.

**Wesley Donaldson | 03:14**
For example, for the secret inputs, it takes the secret. It produces the output like another secret.

**Dominik Lasek | 03:17**
It produces the output like another circuit. Maybe circuit input isn't a good idea.

**Wesley Donaldson | 03:22**
Maybe certain entities are a good idea.
I mean, an AI producer is something that actually returns something different, but the input and output are different than industry input.

**Dominik Lasek | 03:23**
Maybe variant producer is something that actually returns something different, but the input and output are different than in the circuit input.
So, yeah, sure, I can do it this way.

**Wesley Donaldson | 03:31**
So sure, I can do it this way.

**Dominik Lasek | 03:34**
On the thing on the mirror, we can just walk them through that and show that.

**Wesley Donaldson | 03:34**
On the thing on the bureau, we can just walk them through that and show that.

**Dominik Lasek | 03:41**
Okay.

**Wesley Donaldson | 03:41**
Okay, we have those four or five nodes that cover your...

**Dominik Lasek | 03:42**
We have those four or five nodes that cover your requirements from the documentation, but we are still missing like, I don't know, seven of them.

**Wesley Donaldson | 03:53**
Yeah. So there's...

**Dominik Lasek | 03:53**
Or...

**Wesley Donaldson | 03:54**
If I'm thinking about the red stickies versus the yellow stickies, I think we have four yellow stickies, maybe five versus the red.
My first thought when I saw that visually was a little bit jarring, but I think that's all good. I think all we basically say there is we have the document, we've distilled it down, and focus more around our understanding of it.
So say something to the effect of "We view the... We understand the inputs, we understand the outputs, as explained by Jeff..." And just show that we've shown that our visual answers that do we understand that's all you need to worry about.
So we understand these things that we understand the direction around making it modular. But the core ask for that core thing that document is doing is just showing our understanding of it and that we have a plan for inputs and outputs and how to... How each one is modular.

**Dominik Lasek | 04:39**
Right, so you are talking more about the very first Miro diagram that I did based on the Jeff's document, right?

**Wesley Donaldson | 04:44**
Yes, yeah.

**Dominik Lasek | 04:45**
Okay, and then the event sourcing thing is a thing that we should show them or...

**Wesley Donaldson | 04:51**
I mean, it's work that we've done. So generally, if it's valuable work, I think you can phrase it. I wouldn't spend too much time on it, honestly, because as we just said, the conversation Sam has been having in architecture pivots a little bit away from that, but I think that informs the idea of making this more of an event source.

**Dominik Lasek | 05:06**
Okay.

**Wesley Donaldson | 05:06**
So I wouldn't spend too much time on it, just say, "Hey, we as part of our review of the document and trueing up where we are relative to the steps in the document, we did... We took this event approach to see what events aligned to the different steps."
That's basically all you need to do.

**Dominik Lasek | 05:20**
Okay. Okay. Sure. Okay, so basically three things.
That's harnessing the first, very first Miro diagram.

**Wesley Donaldson | 05:24**
Let's harness the very first Miro diagram.

**Dominik Lasek | 05:27**
And as a bonus, this event sourcing right now.

**Wesley Donaldson | 05:30**
I would start with the Miro just because Jeff's direct request... He was very clear like, "I want to see this."
So let's just knock that off first and bus it. I think there's more meat or technology value on the other side of showing the review that we've done. So I would say to start with, "Hey, we hear Jeff's need. Here's what we've done for it, and then here's how we're pivoting going forward.

**Dominik Lasek | 05:53**
Okay, yeah, that that's that makes clear.

**Wesley Donaldson | 05:53**
Okay, you had mentioned in what sound Slack messages idea that you kind of already instrumented you already got, like, the output of the events that are happening inside of the existing UI.

**Dominik Lasek | 05:55**
Yeah, I understand. Okay.

**Wesley Donaldson | 06:08**
Did I misunderstand that?

**Dominik Lasek | 06:10**
That's from yesterday. That's what I showed already, right? That's what you're talking about.

**Wesley Donaldson | 06:16**
No, not the reports like the idea that the UI actually has the output saying that we have made this. To misunderstand that.

**Dominik Lasek | 06:16**
This Jason.
I'm not sure if I understand that.

**Wesley Donaldson | 06:29**
Okay, so if I open the GitHub now and I load up the application, is there a mechanism that currently shows when the events are firing? Like the kind of what you share with Sam. Is there a visual? A visual track?
Maybe a breadcrumb. No, it's just the messages.

**Dominik Lasek | 06:43**
It's no, it's just the yeah, it's just the JSON file that we actually produce while the pipeline is execute executed, so. Yeah.

**Wesley Donaldson | 06:54**
What I would suggest is again, it's work that we've accomplished. So I would say maybe that's the last thing you showed. Like, "Hey, we're already integrating this idea of transparency into the application." But don't spend a lot of time on it because again, the direction is not to focus on the UI but calling out the work that we've accomplished.

**Dominik Lasek | 07:11**
Okay, sure. I wouldn't say it's the UI. I think it's the same pipeline that I don't already know, but with the events that we just added to prove the value.

**Wesley Donaldson | 07:15**
Same pipeline that I don't already know, but with the events that we just added to prove the value.

**Dominik Lasek | 07:20**
So yeah, we can show that, Jason, especially that's the same what Sam showed last time with the auto.

**Wesley Donaldson | 07:20**
So yeah, we can show that. JA, exactly. Yeah, perfect, that's pretty much it.

**Dominik Lasek | 07:28**
So yeah, sure we I can do it. Yeah.

**Wesley Donaldson | 07:33**
I guess then we can tell... Well, since we won't have a status meeting tomorrow, I think my question would be, "Do we have enough things?" I think we do for us to work on to get us into Monday of next week.
So looking at the board, you have the reporting stuff you're taking a big stab at the modularization. That's another ticket that was from yesterday. So it looks like you have enough for the next couple of days, am I wrong?

**Dominik Lasek | 07:55**
I think so. Yeah, I will take a look and I will ask on the Slack if there is anything missing, so. Yeah.

**Wesley Donaldson | 08:00**
Right. Look at that. Get back a couple of minutes.

**Dominik Lasek | 08:03**
No. Thank you so much.

**Wesley Donaldson | 08:04**
Thanks.

**Dominik Lasek | 08:04**
Have a nice day.

**Wesley Donaldson | 08:04**
Much.

**Dominik Lasek | 08:05**
Bye.

