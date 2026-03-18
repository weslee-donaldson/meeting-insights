# TQ, Internal - Mar, 18

# Transcript
**Wesley Donaldson | 00:00**
Son WX.

**Dominik Lasek | 00:01**
Wesley, thousand M5. They cost like, I don't know, three or $400, but my dog liked them too, and that's why I don't have them.

**Nicolas Berrogorry | 00:14**
They are... Why you don't anymore.

**Dominik Lasek | 00:18**
No, not like that. I don't have headphones anymore, but... Survived.

**Wesley Donaldson | 00:20**
[Laughter] Good, well, the surgery is tomorrow, right?
Or is that Tuesday? Your dog's surgery tomorrow?

**Dominik Lasek | 00:32**
Tomorrow, Thursday?

**Wesley Donaldson | 00:33**
Yeah, okay, well, good.

**Dominik Lasek | 00:33**
Yeah.

**Wesley Donaldson | 00:35**
All right, I think we've covered much to cover in today's meeting because I think we have a good bit of clarity based on the conversations over Slack.

**Nicolas Berrogorry | 00:36**
You're taking your dog to...

**Wesley Donaldson | 00:44**
Over Slack.
Let me just share my screen and let's make sure we ground ourselves in what we're tackling. I think for me, the same conversation we always have on a Wednesday. Getting a sense for what is ready enough or chunkable enough for us to share for tomorrow.
So rather than do status, maybe let's talk about that, but see how much time we have left and then we can run through status. Does that work for everyone?

**Dominik Lasek | 01:10**
I think so. Yeah, sure.

**Wesley Donaldson | 01:12**
All right, Don. Do you want to go first? Since... Nicholas... My first... Yesterday.

**Dominik Lasek | 01:17**
So yeah, as it already was discussed on the Slack. I'm going to prepare. I will do my best to prepare those tests, let's say to test all of those layers, not the layer like in the logic as we already decided, but I will prepare something that will allow us to test layers and embeddings itself.
So, yeah. I already have UI that I showed, Nicolas yesterday. It's a separate UI than the pipeline we have. It actually acts up the circuit and it looks up for a similar one in the database.
Yeah, there are still some things I need to do with that but I think that that's really possible. It's going to be ready for the demo today or tomorrow. So, yeah.

**Wesley Donaldson | 02:13**
Nice. Okay, one thing from the conversation with Ruben yesterday was just this idea of how they would go about validating some of the things. So I created this UI like some basic visual defects.
If I can ask you just to take a look through and see what's a low-hanging fruit. If nothing is low-hanging, that's fine. That's most important to get your work presented but if there's something simple here, maybe just increasing the size of a container or something like that, see if that's something that's doable.
If it's not, again, that's fine. Okay, which one?

**Nicolas Berrogorry | 02:46**
I think that you're mixing up that ticket. That ticket is for me. It should be the... Yeah, no problem.

**Wesley Donaldson | 02:51**
Am I looking at... Yes, thank you. I put the wrong content in that ticket. Beautiful. Improves virtualization, I'll fix that. I'll get that over to you. Don't worry about...
And that... To you.

**Nicolas Berrogorry | 03:07**
Okay, so what I plan on presenting is a better way to extract the output of the sequit runs so that people can actually try to extract the meaningful results themselves. I will demonstrate how we can run the short algorithm and try to get the short algorithm output and see that it is resulting in the correct output that we want
but pretending that I am a user, trying to run the short algorithm and doing my own valuation like run suggeststa. The other area that I will cover is basically an ancient variant producer, updated to be able, instead of trying to preserve exactly what the QM looks like in sample, to try to actually integrate QM into the baseline secret, which was one of the issues that we saw with the short algorithm.
So, the other thing that I will show is some improvements to the secret diagram and the. And the math mu basically because I need those to be able to, work with this. And, uhh. Since you added, these two, basically, to tell you what I'm what I changed is the secret diagram is now generating the again like Kiskit it. I did my best.
So it looks as close as possible as what you had done. And the other thing is that the math view was used in a NLM step, which, takes a lot of time and consumes a lot of quite a few tokens. And run like in series for each layer.
So what I found is that we can use KIDSKIT for that. So basically I'm trying to remove the LM step from there. So when we open a. And see a squid. We instantly can see the diagram and see the math output without having to wait for it to too low. Basically, that is like a minor improvement to those two stages and what.
Well, yeah, that that's what I want to them all.

**Wesley Donaldson | 05:36**
So that's a lot. I think my only question would be two things. One, we did identify additional workarounds for those additional circuits open source. I'd like you to just mention that on the call. You don't have to present it. We just mentioned that.
My thinking behind that is it's a chance to get feedback from not just Ruben on the value of that, right? Especially when you're having a conversation around... And just improvements down the line.

**Nicolas Berrogorry | 05:57**
No.

**Wesley Donaldson | 06:00**
More data in is usually a good thing or qualified data in.
So mention that on the call. The other thing I have is around the work that you did in a circuit up AC categorizer. It may not be ready. Do you think it's not ready to present the work? But do you...? What are your thoughts?
Present the thinking of where you're going with that. Because you spent a good amount of time a couple of days.

**Nicolas Berrogorry | 06:23**
And it's been. Yeah, and it's been sort of reviewed by Ben. And he said, like, if we were to do something like that, it would take, like a year and a se. An afterthought that I had, like, well, maybe we don't want to start doing that right away, but maybe we can feed from that slowly and slowly try to wilt towards that in the background, but starting with the specific examples like he cell.

**Wesley Donaldson | 06:49**
So hold on, let's just... I want to get this across to the team... Work where it ends is not lost work. We should still present... Here's what we did and why and here's why it's ending because that's valuable, right?

**Nicolas Berrogorry | 07:02**
Okay, out of scope.

**Wesley Donaldson | 07:02**
So Ruben's direction that "Hey, this is not... It's just too much variability. Too much is valuable."

**Nicolas Berrogorry | 07:08**
Yeah.

**Wesley Donaldson | 07:09**
I want Jeff to have an opportunity to agree or disagree with that, or Florian as well. So what I would say for you is maybe start your demo with explorations and the out and the completion of them or closing out of them, and then you can run into...
Okay, well, we have this thing that is actionable that we're moving forward with that makes sense.

**Nicolas Berrogorry | 07:27**
Okay, got you. Yeah, I can do that.

**Dominik Lasek | 07:30**
Yup.

**Wesley Donaldson | 07:30**
Okay, cool. All right, so I think that's clear. So we don't tend to have a lot of follow-ups after the demo.
So maybe what are we working on post-demo? Maybe I'll put it... It's hard to get time in that window. What are we working on post-demo? There's like we just touched on what we're bringing, what's after that.
So Dominic, I think you're continuing with RAG. Is that a correct fair statement? Okay, great.

**Dominik Lasek | 07:55**
I think so.

**Wesley Donaldson | 07:55**
So you continue with Rinor on Thursday and Friday.

**Nicolas Berrogorry | 07:56**
Yeah.

**Wesley Donaldson | 07:59**
Nicolas, you're going to focus on just the... I think you're just going to continue on the circuit like the truing up of the circuits and the testing of that.

**Nicolas Berrogorry | 08:07**
Yeah, the SAMP like making sure that the samples are getting... Is any meaningful way introduced there and that we can get the output out and... So it will be like a test harness now like following... Do philosophy of creating some sort of helper to go over the tests.
But basically what I would do is create some test situations where I'm a user and I'm logging into a site and I want to try my algorithm. How do I get the output out? How do I put it in? How do I compare that? The result is correct.
That will help with Lucas because Lucas really wanted that, has been wanting that for a while, and I didn't fully understand what he wanted.

**Wesley Donaldson | 08:49**
Yeah.

**Nicolas Berrogorry | 08:54**
But now, in the context of Rinor's feedback, I think that we can get something that makes me happy too.

**Wesley Donaldson | 09:01**
Perfect. And again, just a reminder when you can just... What you just did there, like the idea of grounding what we're doing based on feedback or steps that are inside of Jeff's document.
So just keep that on top of mind. Still ground them. Okay.

**Nicolas Berrogorry | 09:16**
Yeah.

**Wesley Donaldson | 09:16**
Looks good from my perspective. There are a few additional things that the team wanted to tackle. For example, we brought back up the whole manual testing and we touched on that.
I think we still have enough work to chew up. So let's get through that and then we can have... When we have an architecture conversation tomorrow with Jeff, I'll just bring back up to him. "Hey, here are the things that we currently have, which is the right prioritization for us to tackle."
So don't worry about that. Stay on your course until you get additional or new direction, which I should have by Friday. That makes sense. Same as before. If there is anything impactful from the conversation on Thursday, I'll give you guys a readout on Thursday night. My time. That way you have enough time not to be shocked in roundtable.

**Nicolas Berrogorry | 10:00**
Okay, I have one item, but only when you're done.

**Wesley Donaldson | 10:05**
We could go ahead.

**Nicolas Berrogorry | 10:06**
Okay, so the item that I have is that regarding making progress with the specs from Chef. So, in the specs, there is a next action item that I identified that we can tackle, which is on the simulator. Let me share my screen for one second.
Please let me know when you can see it.

**Wesley Donaldson | 10:35**
Low up with you.

**Nicolas Berrogorry | 10:37**
Okay, so this is the calculator node and this is already doing the shot mean suite max noise suite with min error max error and number of samples. This is one of the requests on Chef's specs.
But there is another request, which is a facility analysis of different parameters. So you know that the sequences have inputs, right? Let me see if I can... Okay. I broke the text view of it.
But the series have inputs and we all know that at this point, we can set the value of the parameters of the circuits that contain parameters. So what Chef documents is, okay, we should run the sequence many times, not only to do the noise sweeping, but to do the noise sweeping across variations of each individual parameter.
So let's say, grab the parameter. Imagine that you have a simple circuit with one qubit. That one qubit requires a parameter. Imagine it's 00:5 when you start. We need to run the sequence many times from 00:44 to 00:45, 00:46, 00:47, 00:48, 00:49, and
00:50, for example. So we need to do a sweep on the value of each parameter individually and try to extract some sort of correlation from all of those runs to show what would be like the fragility of the circuit depending on that suite of parameter value, not only a suite of errors.

**Wesley Donaldson | 12:33**
Yeah, that feels like a whole epoch unto itself. Is my initial thinking one thing?

**Nicolas Berrogorry | 12:37**
It's a lot of work.

**Wesley Donaldson | 12:38**
Yeah, one thing.

**Nicolas Berrogorry | 12:38**
Yes.

**Wesley Donaldson | 12:39**
Let me post to you guys. Can I propose the idea of representing all of the steps inside of Jeff's document on the board, even if it's just a direct pass through so he doesn't actually do anything with the input, it just passes it back onto the next step, just to be able to answer the question of how this pipeline actually runs through all of the steps, even if there's literally no action inside of it exactly on this board?

**Nicolas Berrogorry | 13:01**
Do you mean the bed of Word?

**Wesley Donaldson | 13:04**
Like, don't answer now, but I think that would be that would visually help cement that we are aligned to the steps.

**Nicolas Berrogorry | 13:05**
Okay.

**Wesley Donaldson | 13:10**
And I'm still I still feel like we're not representing our alignment to the steps effectively.
So. Maybe. Let's. Let's talk in the chat about that. Let me go run to this next client meeting.

**Nicolas Berrogorry | 13:21**
Okay.

**Wesley Donaldson | 13:22**
I guys, thank you.

**Nicolas Berrogorry | 13:22**
Sure. Bye. Thanks.

