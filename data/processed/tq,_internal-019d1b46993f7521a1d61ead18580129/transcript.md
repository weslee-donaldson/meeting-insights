# TQ, Internal - Mar, 23

# Transcript
**Nicolas Berrogorry | 00:01**
I am fighting with the variant producer for QMM for the feedback from... Okay, and hello, how are you?

**Wesley Donaldson | 00:01**
I am fighting.
Gentlemen. Continue. What are you fighting? What are you fighting with?

**Nicolas Berrogorry | 00:20**
I am fighting with the QMM I'm working on. Let me take a look at... To tell you precisely. I am working on the multilayer Q placement and the defect variant producer. Integrate human layers into existing sequences.

**Wesley Donaldson | 00:42**
Okay, I think my worry is the same worry I always have here. I just... Which one is a chunk of which one can we actually just complete on its own? I know we've gone back and forth on that.
Do you feel you've made enough progress on the circuit categorizer as an example to be able to do multilayer? Or do we want to just... I feel like the correct answer is just pull this back and focus exclusively on the categorizer as a mechanism to get us to be able to work on the multilayer circuit placement.

**Nicolas Berrogorry | 01:15**
Okay. It's complicated. What I found is that there are so many things that ma the mass align because AMA multilayer placement is basically getting the variant producer for Qmm to work.
And for that, we need to achieve, like, improvements with the agent itself and the placement rules and all of that. And basically, since we don't want to if you remember, we don't want we no longer want to try to go and do like, a Shinada solver because, as, run, say, it's gonna take like a year.
So we want to work from, the samples and I was working on the short sample, for example, the basically we found that from the this Ruben this with Ruben, we found that the QMM was not being applied, it was sort of in parallel and it wasn't really even mindful of the Qwits and all of that.
And we created this defect variant E ticket. I think I just finished that one today.

**Wesley Donaldson | 02:26**
Perfect. Great. So same as always, just throw a comment on it so we can target that for like, hey, here's what we pro and share that in the demo. Great.

**Nicolas Berrogorry | 02:35**
Y.

**Wesley Donaldson | 02:37**
There were visual elements. You fixed that visual element as well. That was the improved visualization UI for QMM Inspector. I gave that to Dominik.
But is that something that you did? Because I saw that in the last demo. Is that not correct?

**Nicolas Berrogorry | 02:50**
Yeah, that one was a very small fix with a full screen, and I needed to do this work. So, I just did it. It's done.

**Wesley Donaldson | 02:58**
Okay, so... But do you mind if... Is this something we're done with or do you think we still have work on it? Okay. Yeah, out of the way. I'll move that to Dominik.

**Dominik Lasek | 03:17**
Yeah, that was my question because I wasn't sure. I remember that you showed that on the last week. Some new improvements on that pipeline. So, yeah.

**Wesley Donaldson | 03:28**
Cool. Okay, so sorry, Nicholas, just to close it out then. So, for you, we're still... It sounds like we're still working on the variant. You feel like this is done. Is it done enough for us to pull over or do you want to just...

**Nicolas Berrogorry | 03:40**
Yeah, I'm documenting now, and I'm about to close it. I'm going to put the findings on how I sold it and all of that. But basically, now the Orient producer is indeed detecting the different... Basically detecting the different... Quebits that we have on different circuits and trying to apply QMM specifically because Q is integrating. I found some extra work that I had to do for this ticket, which is basically since we need something else called ancillary quebits, which are extra quebits for redundancy, that get added. Those were basically getting confused with the inputs of the user.
So I did more prompt engineering to get these prompts to produce separate parameters in separate queues. And now it looks fine. I think it's okay to close this ticket for now. The specific defect...

**Wesley Donaldson | 04:40**
But I ask you, make sure you get those comments in because I want to be able to...

**Nicolas Berrogorry | 04:43**
Yes.

**Wesley Donaldson | 04:44**
All right, let's...
So then just to close out, you're now focused on just the sort of categories. So if you need to work on the multi-QMM placement as part of that, that's fine. I just want to have one thing that we're focused on.

**Nicolas Berrogorry | 04:58**
Okay, I think it's better. It would... It might be more interesting to focus on the categoryer, as you said, instead of the multi-QMM but to tackle that, I need to go for the graph-based route.

**Wesley Donaldson | 05:06**
Agreed.

**Nicolas Berrogorry | 05:13**
So maybe that one is another one that we want to push back. So the categoryer depends...

**Wesley Donaldson | 05:21**
Okay, good. Perfect the...

**Nicolas Berrogorry | 05:23**
Sorry, my, but like, I meant like, it's it would be better to focus on the graph base than the building the actual categorizer, which is the other one I have on the top.
Yeah, okay, yeah, no, sorry, I don't want to create noise, but basically, I meant that, just like I fixed that defect that helps a lot with multi layer QM placement.

**Wesley Donaldson | 05:34**
So like that then.

**Nicolas Berrogorry | 05:54**
And for that, I need to work on. On some more stuff.
Like the secret categorizer graph based RAW is like sort of like the precursor to build SCT categoorizer for POC and that one I would like move back to ready for them.

**Wesley Donaldson | 06:08**
So then back here perfect.

**Nicolas Berrogorry | 06:10**
Yeah. And that's more realistic to what I'm going to be focusing on.

**Wesley Donaldson | 06:15**
All right, so then, Dom, over to you. So you're still working on the... Tell me some more.

**Dominik Lasek | 06:22**
I can't say that I'm working on this still because... Can you open that ticket? I think mostly all of them is done and we already demo them on Thursday.

**Wesley Donaldson | 06:26**
Sure.

**Dominik Lasek | 06:32**
I'm not sure about the last bullet point that says basic work demo, sample, circuit, battery. What's that? How should I understand the circuit battery?

**Wesley Donaldson | 06:40**
It's just a list. Sorry, it's stupid English words. It's just a list of circuits, basically.

**Dominik Lasek | 06:51**
Okay, so for this particular thing, we have the separate UI that's much easier to upload more circuits. I like the list of circuits that test that than through the pipeline, but it works as well in pipeline.
What I think I can do more with this is actually I can take some effort to deploy this one, but I need to talk with Brian or so about the database because we need the PostgreSQL database there, and I'm not sure if it should be inside the pod because it's going to be lost with each deployment.
So that's the thing that I probably should ask Brian how they want to have this database be reconfigured. And, yeah, and to be honest, actually, I can't wait for the planning today, because I'm not really sure what's next.
If that's done, I can't wait for that meeting.

**Wesley Donaldson | 07:48**
Sorry, you can make it or you cannot make it. Good. Yeah, so... That's why I threw it on the calendar.
It's a lot of been like high-level up here. Conversations, not a lot of let's actually implement something. One thing that I've heard that was clear in the meeting was this idea of just closing out the Florian experiment, which just looks like it's basically running and distilling the data coming out. Is this something where you can take independently of Nicholas to allow him to focus on the categorizer?

**Dominik Lasek | 08:18**
I'm not sure, because most probably I cannot remember that, Orient experiment was about. I need to. I need to read this description. And then I will be able to give you an answer.

**Wesley Donaldson | 08:31**
Okay, this feels like something that we've already done. Just like this is just like go ahead, this is like a precursor to us getting for the rag work.

**Dominik Lasek | 08:38**
N not really, it's not even touched. Yeah.

**Wesley Donaldson | 08:47**
Did you ultimately find they're not related?

**Dominik Lasek | 08:50**
No, it's not. It's more about having a circuit object. Let's say that starts from the very first node and it grows through each node in the pipeline, and it's not related to the rack.

**Wesley Donaldson | 09:02**
Yeah, gotcha.

**Dominik Lasek | 09:05**
I would say.

**Wesley Donaldson | 09:06**
Okay. Is this something we could tackle? That feels like something that we can tackle as a gate to getting to the Florence experiment.
I think my only worry here is that this is something internal for us. This is something tangible that they want to see. So I almost feel this is the higher priority.

**Dominik Lasek | 09:24**
Yeah, you can send that to me. I will, I need to read this one. I need to most sorry, I will yeah, I will try to find the I what's what the tickets about.

**Wesley Donaldson | 09:33**
Okay. Then for this one, the only thing that's left here is just... I added this last acceptance criteria just to deploy it. So that's what's remaining. Then we can move on to the Florence experiment one.

**Dominik Lasek | 09:46**
I think so. Yeah, like the rag system works. Only thing that needs to be done, maybe not done, but improved are those layers.
So it's something that probably we should have deployed this one to put this system to the Sasha or Slava hands. And they can just test those layers, and they can say if it's good or if it's bad, and they need to improve that. I'm not sure if I'm
the best person to create layers for circuits.

**Wesley Donaldson | 10:19**
No, don't worry, we got it. That's where we're going to get Sasha and Slavas help. All right, so then we're good, and then we have the meeting. As you said, we have the meeting this afternoon. What is it like in about two hours or so? An hour and a half.
The goal for that meeting is just... You're aware we have a couple of things that came up around orchestration. We have a couple of things that came up around how we can expand the MCP tooling and how we can better be leveraging events sourcing architecture.
So the goal for that session is really to give Sam a perspective, a chance to speak to what's our next major priority. I think orchestration was one of the biggest ones. Maybe looking at orchestration for MCP pipelines like using LLaMA using the SDK from Google or something like that's the general goal of the call to come to what's our next target.

**Dominik Lasek | 11:11**
Okay. Okay, yeah.

**Wesley Donaldson | 11:13**
Right? I will give you back a minute so I could take that phone call. It looks like we're clear on what our next couple of tasks are.

**Dominik Lasek | 11:20**
I think so. Yeah, thanks, CIA.

**Wesley Donaldson | 11:22**
All right, guys, thank you so much.

**Dominik Lasek | 11:24**
Thank you. Bye.

