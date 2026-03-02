# Engineering Roundtable - Feb, 27

# Transcript
**Wesley Donaldson | 00:32**
Where' is my sound? Test. Test? Test works.
I but sound that works.
Good morning. It was.

**Speaker 2 | 01:12**
Morning. Afternoon. Evening.

**Wesley Donaldson | 01:19**
All of the times that let my mind...
Well, we're waiting for Jeff.

**Speaker 2 | 01:35**
Well, we're waiting for Jeff. If anyone got anything they want to they wanted to bring up urgent for the meeting, anything burning on anyone's mind.

**Wesley Donaldson | 01:37**
Anyone got anything they want to they wanted to bring up or even for the meeting burning on anyone was Mike. I saw there was some comments about is to this product.

**Speaker 2 | 01:49**
I saw there was some comments about. Builds of the Divis product. Should we talk about that?

**Wesley Donaldson | 01:57**
Shall we talk about that or anything to talk about as far as the Windows?

**Speaker 2 | 01:58**
Is there anything to talk about as far as the Windows?

**Speaker 3 | 02:02**
Yeah.

**Wesley Donaldson | 02:02**
Yeah.

**Speaker 3 | 02:02**
So, one question I have is, is it possible to get Windows?

**Wesley Donaldson | 02:02**
So, one question I have is, is it possible to get Windows 2019 GitHub workers back?

**Speaker 3 | 02:08**
2019 GitHub workers back. Because we have set up the build process or the entire build chain for Windows.

**Wesley Donaldson | 02:12**
Because we have set up the build process of the entire B chain for Windows.

**Speaker 3 | 02:17**
2019.

**Wesley Donaldson | 02:17**
2019, and we would have to rewrite a lot of the new project or at least we would have to change several things.

**Speaker 3 | 02:18**
We would have to rewrite a lot of the project. Or at least we would have to change several things, and it would take a bit of time.

**Wesley Donaldson | 02:29**
It will take a bit of time to get to...

**Speaker 2 | 02:31**
To get to...

**Wesley Donaldson | 02:34**
We can do a little bit more research, but I think that's a GitHub-wide thing.

**Speaker 2 | 02:34**
We could do a little bit more research, but I think that's a GitHub-wide thing. I think they announced the deprecation already a year or two ago.

**Wesley Donaldson | 02:38**
I think they announced a deprecation already a year or two ago, and when they announced it, they said that they were going to start.

**Speaker 2 | 02:41**
Yeah, when they announced it, they said that they were going to start. It seemed like they were going to reduce capacity, right?

**Wesley Donaldson | 02:46**
It seemed like they were going to reduce capacity, right, so that it might take longer and longer to get builds and maybe even fail some.

**Speaker 2 | 02:48**
So it might take longer and longer to get builds and maybe even fail some. Some people were aware of the deprecation policy.

**Wesley Donaldson | 02:52**
If people are aware of the deprecation policy now that it's a year or two later or whatever it is, I get the exact time.

**Speaker 2 | 02:54**
Now that it's a year or two later, whatever it is, I forget the exact timeline.

**Wesley Donaldson | 02:58**
One, and I don't know if they just completely stopped it or what.

**Speaker 2 | 02:58**
I don't know if they've just completely stopped it or what. You a little bit to see if I get a definitive answer.

**Wesley Donaldson | 03:02**
You will see if I can get a definitive answer, but maybe if we get it, we're probably on borrowed time, right?

**Speaker 2 | 03:04**
But even if we get working, we're probably on borrowed time, right? We have to invest in updating whatever we need.

**Wesley Donaldson | 03:09**
We may have to update whatever we need.

**Speaker 2 | 03:15**
How much do we need to update?

**Wesley Donaldson | 03:15**
How much do we need to update it?

**Speaker 2 | 03:16**
Is it just about dependencies, basically, and compatibility with the OS?

**Wesley Donaldson | 03:16**
Just about dependencies basically in compatibility with thes.

**Speaker 2 | 03:20**
Yeah.

**Wesley Donaldson | 03:20**
Yeah. So we would have to change dependencies and the product set up and the Clear View project set up is quite big and there's a lot of, different projects in it in the project forward need to be changed and we don't it's not that we have customers that depend on that, it's just that our build set up is right way.

**Speaker 3 | 03:21**
So we would have to change dependencies and the project setup and the Clearview project setup is quite big, and there's a lot of different projects in it and in the project... That need to be changed.

**Speaker 2 | 03:42**
And we don't. It's not like we have customers that depend on that. It's just that our build set up.

**Speaker 3 | 03:48**
I don't know. I know we never got to a new version because the 2019 version is the last that supports 32-bit architecture, and I don't know if we still have customers who will use it.

**Wesley Donaldson | 03:49**
No, we never got to a new version because the 2019 version is the last that supports 32-bit architecture, and I don't know if we still have customers.

**Speaker 2 | 04:05**
I have asked.

**Wesley Donaldson | 04:05**
I asked Peter Cross to answer me exactly that.

**Speaker 4 | 04:06**
Peter Cross to answer me exactly that. So far, my understanding is that Python and Linux are working fine.

**Wesley Donaldson | 04:09**
So far among and the past and Linux are working fine. The promising Windows.

**Speaker 4 | 04:13**
The promising Windows.

**Wesley Donaldson | 04:15**
My assumption is that most of our clients are using Windows, but I just don't know.

**Speaker 4 | 04:15**
My assumption is that most of our clients are using Linux, but I just don't know.
So I ask him.

**Wesley Donaldson | 04:20**
I hope he can cle back to Me on Monday.

**Speaker 4 | 04:21**
I hope he can circle back to me on Monday.

**Speaker 2 | 04:24**
Okay, that version of Windows is out of support already too.

**Wesley Donaldson | 04:25**
That version of Windows is out of support already too.

**Speaker 2 | 04:28**
Like it still has security releaseses.

**Wesley Donaldson | 04:28**
It's less secure since they do that for a couple more years, but I would guess not many customers are actually running 2019 anymore.

**Speaker 2 | 04:30**
They do that for a couple more years, but I would guess not many customers are actually running 2019 anymore.

**Speaker 4 | 04:39**
I guess.

**Wesley Donaldson | 04:39**
I don't know.

**Speaker 2 | 04:39**
I know enterprise environments can lag for a long time, but yeah.

**Wesley Donaldson | 04:40**
Enterprise environment's been like for a long time, but okay, I'll dig into GU just to see if there's a better answer than they seem to be purposely breaking it to encourage people to move forward.

**Nicolas Berrogorry | 04:46**
Okay.

**Speaker 2 | 04:47**
I'll dig into GitHub just to see if there's a better answer than they seem to be purposely breaking it to encourage people to move forward.

**Wesley Donaldson | 04:56**
But you haven't seen the germ right aways because they still use Windows 95 their trends actually [Laughter] or cloud code is going to just help everyone, right?

**Speaker 6 | 04:56**
But you haven't seen the German railways because they still use Windows 95 in their frames, actually.

**Speaker 2 | 05:06**
Well, cloud code is gonna just help everyone, right? Did we see the thing this week where they're now they're doing basically upending IBM's consulting business for all the mainframe development.

**Wesley Donaldson | 05:10**
Do we see the thing this week where they basically offing IBM's consulting business, all the mainframe development, all those guys that had easy jobs, I guess some job security?

**Speaker 2 | 05:20**
All those guys that had easy jobs, I guess, and job security.

**Wesley Donaldson | 05:31**
Alright, well that's one that I don't think anyone else had anything I could say.

**Speaker 2 | 05:31**
Alright, well that's another thing that I had to bring up. Anyone else got anything?

**Speaker 3 | 05:40**
I could say...

**Wesley Donaldson | 05:41**
One more thing.

**Speaker 3 | 05:41**
One more thing. So if we want to have the Python CVA wheels, I can build them locally.

**Wesley Donaldson | 05:42**
So if we want to have the Python CVA means I can build time. No one, just the automatic build process.

**Speaker 3 | 05:48**
Just the automatic build process doesn't run right now.

**Wesley Donaldson | 05:51**
That doesn't work well.
So youys ready?

**Speaker 2 | 05:54**
So. Wone these that you were doing Python builds and Windows too.

**Wesley Donaldson | 05:55**
At least the you were doing Python build and Windows too.

**Speaker 6 | 06:00**
Yeah, okay, I guess that's all fine, right?

**Wesley Donaldson | 06:00**
Yeah, okay, I guess that's on the... I'm right, but we say we ought to make the next squeeze for now, and if someone wants a Windows, we can just hand them the customer actual process that we are following in the... Right?

**Speaker 6 | 06:06**
But we say we automate the Linux wheels for now. If someone wants a Windows build, you would just send them a customer one.

**Speaker 4 | 06:18**
What is the actual process that we're following in DVS, right? So the idea is that we host the Linux.

**Wesley Donaldson | 06:22**
So the idea is that we host the Linux.

**Speaker 4 | 06:25**
Let's see how many clients go with that.

**Wesley Donaldson | 06:25**
Let's see how many plans go with that.

**Speaker 4 | 06:27**
If someone demands any type of software, then we will use a different channel to deliver this type of product.

**Wesley Donaldson | 06:27**
If someone demands any help of software, then we will use a different channel to deliver this type of product.

**Speaker 4 | 06:36**
I mean, we don't have any other option.

**Wesley Donaldson | 06:36**
I mean, we don't have many options. It's probably just going to be mostly manual for those rights, hard to invest in automated.

**Speaker 6 | 06:38**
Right? Yeah.

**Speaker 2 | 06:41**
Yes. It's probably just going to be mostly manual for those, right? It's hard to invest in automating one.

**Speaker 4 | 06:48**
Yeah, I assume it's going to be some kind of SFTP or something like that, but I need to talk to Peter.

**Wesley Donaldson | 06:48**
Yeah, I assume it's going to be some kind of SFTP or something like that by any means.

**Speaker 4 | 06:53**
I assume that we have already delivered this tab of...

**Wesley Donaldson | 06:53**
I assume that we know really that even disco so of the core is in that channel.

**Speaker 4 | 06:56**
So we'll be forcing that channels just to keep using that until we can do it a little more automatically.

**Wesley Donaldson | 06:59**
Just to be using that. I think we can get it into automatically.
Alright, well yeah, if you could share anything with us about the customer needs.

**Speaker 2 | 07:09**
Right? Well, yeah, if you can share anything with us about customer needs, David.

**Wesley Donaldson | 07:13**
David starts at 20:19 and I'll share back if I find anything about GitHub options you might have about what you've seen for that.

**Speaker 2 | 07:13**
As far as 2019. I'll share back if I find anything about GitHub options. We might have about 20:19, I'll do that.
Yeah, sure.

**Wesley Donaldson | 07:22**
Yeah.

**Speaker 2 | 07:35**
We had a demo already from the Vsavio team yesterday, right?
Maybe this is it.

**Wesley Donaldson | 07:42**
This is Z I'm wanting it.

**Speaker 2 | 07:43**
I don't know if we're going to get Jeff.

**Wesley Donaldson | 07:44**
Jeff... Nobody else says anything of their minds... Calling up the demo yesterday.

**Speaker 2 | 07:45**
Nobody else has anything on their minds.

**jessica@terraquantum.swiss | 07:50**
No, the recording of the demo yesterday. I will publish that one later.

**Wesley Donaldson | 07:52**
ICAL Neb sorry, thank you.

**jessica@terraquantum.swiss | 07:54**
Sorry for that.

**Nicolas Berrogorry | 07:59**
Maybe just a brief mention.

**Wesley Donaldson | 07:59**
Maybe just a brief mention.

**Nicolas Berrogorry | 08:02**
Ryan.

**Wesley Donaldson | 08:02**
Brian.

**Nicolas Berrogorry | 08:02**
That we continue mapping Chef's nodes into what we have in different ways, both in Miro and the CorelDRAW under the doc folder in the Q optimizer repository where basically we have the same notes from Chef, but this time converted into an MD file with checkboxes and with underline comments.

**Wesley Donaldson | 08:03**
We've continued mapping Chef's notes into what we have in different ways, both in Miro and add a st under the doc folder in the optimizer repository where basically we have the same notes from Chef, but this time converted into an MD file with checkboxes and with underline comments.

**Nicolas Berrogorry | 08:28**
So we may have a progress here in that.

**Wesley Donaldson | 08:28**
So we made a real progress in that.

**Nicolas Berrogorry | 08:30**
I mean, you can clarify where we're at.

**Wesley Donaldson | 08:30**
If you clarify where we're at, that's it.

**Nicolas Berrogorry | 08:33**
That's it.

**Speaker 2 | 08:34**
Okay, we did have a meeting yesterday.

**Wesley Donaldson | 08:34**
Okay. We did have a meeting yesterday.

**Speaker 2 | 08:37**
Did you guys happen to catch the recording of that already?

**Wesley Donaldson | 08:37**
Did you guys have any catch of reporting on...? No worries, we thanks Brian, good call out. We had a great session.

**Speaker 2 | 08:39**
No, Wesley was there.

**Nicolas Berrogorry | 08:41**
Yeah, we just got it, and we're going to love it.

**Speaker 2 | 08:43**
Sorry.

**Wesley Donaldson | 08:48**
We distilled it down, we're tracking it up an architecture log so the notes are there. Feel free to take a look at the notes and if there is something that I missed there, please.
But like the core decisions are upfront. That's kind of what the team is marching towards. Core decisions are things along the lines that we want to add transparency to the experience and we want to pivot away from just exclusively thinking about this as a UI experience and stepping back and think of it more as a modular experience.
Like different packages that could be chained together and within each package is an opportunity for additional enrichment and evolution specific to the quantum like use cases that we may have. So great direction coming from Sam and Jeff there.
So marching towards that now underscore too that I think Sal istracting this pretty well to redo the he was talking to.

**Speaker 2 | 09:29**
Yeah, I was just going to underscore too, that I think Sam is tracking this pretty well. If you read the review of the meeting, he was talking through it. But we were kind of going back to one of the original things, which was to sort of establish the baseline of applying QMM right.

**Wesley Donaldson | 09:37**
But we were kind of going back to one of the original things, which was to sort of establish the baseline of applying to AM.

**Speaker 2 | 09:47**
So some process that basically you simulate, you get the results, then you apply all kinds of random types of implementations of QMM, then simulate again, and then measure.

**Wesley Donaldson | 09:49**
So process that basically, you simulate, you get the results, then you apply all kinds of random types of implementations of QMM, then simulate again, and then measure.

**Speaker 2 | 10:00**
It seems like we're still, as far as I know, kind of missing that piece.

**Wesley Donaldson | 10:00**
It seems like we're still, as far as I know, kind of missing that piece.

**Speaker 2 | 10:03**
That's what we were talking through a big chunk of yesterday.

**Wesley Donaldson | 10:03**
That's what we were talking through a big chunk of yesterday, and Nicholas, you don't want to talk about so far, right?

**Speaker 2 | 10:10**
Nicholas, you know what I'm talking about so far, right? As far as...

**Wesley Donaldson | 10:13**
As far as what does that make sense?

**Nicolas Berrogorry | 10:14**
What does that make sense? We... Yeah, it all makes sense right now.

**Wesley Donaldson | 10:17**
It makes sense right now.

**Nicolas Berrogorry | 10:18**
Basically, our baseline runs in parallel with the random circuit because the input from the... We don't use the input from the first run as the baseline.

**Wesley Donaldson | 10:18**
Basically, our baseline runs in parallel with the random sequence because the input from the... We don't use the input from the first run as the baseline.

**Nicolas Berrogorry | 10:28**
Our baseline, like we provide manually as an expected value, something like that.

**Wesley Donaldson | 10:28**
Our baseline, like we provide manually as an expected value, something like that.

**Nicolas Berrogorry | 10:33**
And it needs to evolve into that.

**Wesley Donaldson | 10:33**
And it needs to evolve into that for sure.

**Nicolas Berrogorry | 10:35**
For sure.

**Speaker 2 | 10:37**
Yeah.

**Wesley Donaldson | 10:37**
Yeah. So that...

**Speaker 2 | 10:37**
So then one of the things we talked about which it may not necessarily immediately...

**Wesley Donaldson | 10:38**
So then one of the things we talked about, which it may not necessarily immediately but can we capture all that data so that maybe we could start building a model to make better decisions about how to apply QMM to the inputs?

**Speaker 2 | 10:42**
But can we capture all that data so that maybe we could start building a ML model to make better decisions about how to apply QMM to the inputs?
Then could we start randomly generating circuits, right?

**Wesley Donaldson | 10:52**
And then could we start randomly generating circuits, right, to kind of create a bit better of just better data, right?

**Speaker 2 | 10:56**
To kind of create a bit better of a just better data, right? Can we actually do something intelligent about applying QMM to any input?

**Wesley Donaldson | 11:01**
Can we actually do something intelligent about applying to any input?

**Speaker 2 | 11:06**
Because it was brought up like just feeding in QA away or anything.

**Wesley Donaldson | 11:06**
Because it was brought up like just feeding in QA away or anything.

**Speaker 2 | 11:10**
But Gloria mentioned it probably doesn't have to be that...

**Wesley Donaldson | 11:10**
But Gloria, I mentioned it probably doesn't have to be that we might as well just create random data and test as many variations as we can for input.

**Speaker 2 | 11:13**
We might as well just create random data and test as many variations as we can for input.

**Nicolas Berrogorry | 11:20**
Yeah, that's that I'm... With recently, as I shared in the last meeting, I got a random secret generator that has all the requirements from...

**Wesley Donaldson | 11:20**
Yeah, that's that I'm aligned with recently. As I shared last meeting, I got a random secret generator that has all the requirements from... So it would be a matter of running it and capturing the data and showing you the data so you can tell us, "Hey, we are missing like I don't know, some sort of parameter or some sort of measurement."

**Nicolas Berrogorry | 11:29**
So it will be a matter of running it and capturing the data and getting it to show you the data so you can tell us, "Hey, we are missing like I don't know, some sort of parameter or some sort of measurement." Just making sure that the output data we generate is correct for you.

**Wesley Donaldson | 11:42**
Just making sure that they all beta missary is correct for you.

**Nicolas Berrogorry | 11:45**
But we are in a position to do that with random circuits for sure.

**Wesley Donaldson | 11:45**
But we are in a position to do that with... For sure.

**Nicolas Berrogorry | 11:49**
My understanding is that in yesterday's meeting, it was discussed that we should prioritize prompt engineering for the agents because the agents are now very robust.

**Wesley Donaldson | 11:49**
My understanding is that in yesterday's meeting, it was discussed that we should prioritize prompt engineering for the agents because the agents are now very robust like we can parameterize them.

**Nicolas Berrogorry | 11:58**
Like we can parameterize them. We can process many variants and generate many variants for each input variant and all of that.

**Wesley Donaldson | 12:00**
We can process many variants machinery and many variant sales for each input variant and allow so they are ready to actually start trying to do meaningful work with them.

**Nicolas Berrogorry | 12:06**
So they are ready to actually start trying to do meaningful work with them.

**Wesley Donaldson | 12:10**
So.

**Nicolas Berrogorry | 12:10**
So yeah, we should explore that ure M more in that.

**Wesley Donaldson | 12:10**
So yeah, we should explore that more. We are set up for recording the results of every run that we have to do such that we could start training a model.

**Speaker 2 | 12:17**
Are we set up for recording the results of every run that we have to do such that we could start training a model if we... Yes.

**Wesley Donaldson | 12:27**
Yes, on all that, we...

**Nicolas Berrogorry | 12:27**
And all that. Yeah.

**Wesley Donaldson | 12:29**
Yeah, we should have to start capturing it, but for sure we can begin recording that and try it on a more massive scale.

**Nicolas Berrogorry | 12:29**
We should have to start capturing it. But for sure we can begin recording that and try a more massive scale. It's more paradzd now than before.

**Wesley Donaldson | 12:36**
It's more paradise now than before.

**Nicolas Berrogorry | 12:39**
So the agents basically for each input it generates the variance e in parallel.

**Wesley Donaldson | 12:39**
So the agents basically for each input, it generates the variant in parallel and probably more regarding that can be done beware that it will begin eating through tokens once we do that.

**Nicolas Berrogorry | 12:46**
Probably more conversation regarding that can be done. Beware that it will begin eating through tokens once we do that. So right now I'm using... I think it's a... For some reason I had to use a personal cloud key, but it has it in like three cents. It's nothing.

**Wesley Donaldson | 12:54**
So right now I'm using... I think it's a... For some reason, I had to use a personal cloud key, but it has it in like three cents. It's nothing, but I will probably ask for a key at some point.

**Nicolas Berrogorry | 13:05**
I will probably ask for a key at some point.

**Speaker 2 | 13:10**
Did we get anywhere?

**Wesley Donaldson | 13:10**
Did we. Did we get anywhere?

**Speaker 2 | 13:11**
I mentioned a couple of weeks ago about looking at this... It may be a Cosmos thing too, as much as you guys... But looking at making the queries through agent gateway because we have agent gateway in the environment.

**Wesley Donaldson | 13:12**
I mentioned a couple of weeks ago about looking at this... It may be a positive thing too, as much as you guys... But looking at making queries through agent gateway because we have agent gateway in the environment.

**Speaker 2 | 13:24**
So the...

**Wesley Donaldson | 13:24**
So the outbound queries to Claude or OpenAI so that we could put token caps on those just so that we prevent runaway this number.

**Speaker 2 | 13:24**
So the outbound queries to Claude or OpenAI? So that we could put like token caps on those just so that we prevent runaway loops that run into $10,000.

**Speaker 6 | 13:38**
I understand this is a thing, but as I wouldn't prime primarily do right because it's like setting it up once I assume.

**Wesley Donaldson | 13:43**
And I read do right because it's like setting it at yeah, at least on the if it on the Xolv side like we're using Claude through like, Claude teams.
So we have native built in caps by virtue of just like there's a limit of how much you get and then it kind of pauses and you can come back in three hours, come back in two hours to get the next. So it hasn't been a block yet.
But Brian, if that's a direction you want to have that for, maybe recording, maybe future optimizations, you want to see those going through, that's something we can investigate doing.

**Speaker 2 | 14:16**
I think it matters only when we switch off the basically individual developer accounts, right?

**Wesley Donaldson | 14:16**
I think it matters when we switch off the developer to the life. Basically individual developer comes, right?

**Speaker 2 | 14:23**
So if those are still working for development purposes, that's fine.

**Wesley Donaldson | 14:23**
So if those are still working for development purposes, that's fine.

**Speaker 2 | 14:27**
Yeah, but if there's some reason that we have to go to API basically, yeah.

**Wesley Donaldson | 14:28**
But if there's some reason that we have to go to API basically sounds good. I think we need to do that anyway when we move this beyond, as you said, the exploration phase one actually, sorry, one thing, it will actually be interesting to have that actually in place already even if we just do prototyping and stuff because I saw some like secret hanging around with an ad somewhere.

**Speaker 6 | 14:42**
That I would actually... Sorry. One thing. It would actually be interesting to have that actually in place already even if we just do prototyping and stuff because I saw some like secret hanging around with an ad key somewhere.

**Speaker 2 | 14:56**
Yeah, the Gateway can handle the secret.

**Wesley Donaldson | 14:56**
Yeah, because we can just like have the gateway have like the gateway manage the like model and or like the ents for the models and so on.

**Speaker 6 | 14:58**
Yeah, because we can just like have the gateway have like the gateway manage the like models and or like the endpoints for the models and so on.

**Speaker 2 | 15:09**
Yeah, it's...

**Wesley Donaldson | 15:09**
Yes, it's probably worth someone looking into.

**Speaker 2 | 15:09**
It's probably worth someone looking into.

**Wesley Donaldson | 15:14**
I didn't...

**Speaker 2 | 15:14**
I didn't fully...

**Wesley Donaldson | 15:15**
Fully...

**Speaker 2 | 15:15**
But I got the impression there's at least one way to try to turn everything into OpenAI compatible.

**Wesley Donaldson | 15:15**
But I got the impression. Like. There's at least one way to try to turn everything into, like, open AI compatible.

**Speaker 2 | 15:22**
So...

**Wesley Donaldson | 15:22**
So...

**Speaker 2 | 15:23**
So if you know how to use OpenAI APIs, you could still talk to Claude or Gemini, I guess is the idea or the best way to do it.

**Wesley Donaldson | 15:23**
So if you know how to use OpenAI APIs, you can still talk to Claude or Gemini. I guess that's the idea that the best way to do it is to use OpenAI APIs.

**Speaker 2 | 15:36**
Or if it's passing through every native API, I'm not sure, but that's probably worth a little bit of research.

**Wesley Donaldson | 15:36**
Or if it's passing through every native API item? I'm not sure, but that's probably worth a little bit of research.

**Speaker 6 | 15:43**
I mean, we could like try going in one direction and like say, okay, everything is under like the open AI API and then like if we meet any limitations, then we can just say, okay, we have to go a different RO.

**Wesley Donaldson | 15:43**
I mean, we could like try going in one direction and like say okay, we do this on the may I API and I'm like if we need any limitations so I can just be able to current include someone want to set or are you interested in researching that a little bit?

**Speaker 2 | 16:03**
Someone wants to... Are you interested in researching that a little bit? I don't know.

**Wesley Donaldson | 16:06**
I don't know if you have to ban it, I can try to see if I have some time.

**Speaker 2 | 16:06**
If you have the bandwidth.

**Speaker 6 | 16:11**
I can try to see if I will have some time. It's...

**Speaker 2 | 16:16**
Yeah, I feel like it's not a priority, but if engineering can make a decision like we think OpenAI standardization makes more sense than going native, then maybe we can pass that to Cosman to just play around with implementing a little bit, even have to commit to it yet, but we can try it out, right?

**Wesley Donaldson | 16:16**
Yes, I think...
I mean, it's not a priority, but if engineering can make a decision like we think OpenAI standardization makes more sense than going native, then maybe we get past that. To Cosman, to just play around with implementing a little bit. We don't have to commit to it yet.
But we can try it out, right? I do have some API keys for, I guess, at least my... And short from terracontent.

**Speaker 6 | 16:37**
I mean, I do have some API keys for I guess at least open AI and Claude from Terocontum. So like, I could play around locally if that makes sense to like, use it and like if there are any quotations and I could document that first and then we can make a another that this is if we want.

**Wesley Donaldson | 16:46**
So like I could play around locally if that makes sense to like use it and like if there are needs and I could document that first and then we can we can know about this. Is every one sure?

**Speaker 2 | 16:56**
Sure, yeah, and if you need any others, we can provide them.

**Wesley Donaldson | 16:57**
Yeah, if any others we can provide, we have Jetly available if it's interesting.

**Speaker 2 | 16:59**
We have Gemini available too. That way, if it's interesting, yeah.

**Speaker 6 | 17:02**
Getting Gemini and IAPIQ season with us specifically.

**Speaker 2 | 17:10**
Okay, well, Jeff's here now.

**Wesley Donaldson | 17:11**
So, just as we chat about recapping yesterday's meeting with Xolv about QMM and then we were just talking about if and when we want to put a gateway to cap token usage just so we don't have runway issues.

**Speaker 2 | 17:13**
Hey, Jeff. We were just chatting about recapping yesterday's meeting with Xolv about QMM and then we're just talking about if and when we want to put a gateway to cap token usage just so we don't have runway issues. Other than that, I think we exhausted everyone's burning agenda items.

**Wesley Donaldson | 17:32**
Other than that, I think we exhausted everyone's burning agenda items.

**Speaker 8 | 17:40**
In other words, it's Friday and everybody wants to get the hell out of here.

**Wesley Donaldson | 17:40**
In other words, it's Friday and everybody wants to get down out of here. It seems like no.

**Speaker 2 | 17:45**
Seems like that.

**Speaker 8 | 17:47**
No. If in when we want to put some cap on the tokens.

**Wesley Donaldson | 17:49**
If and when we want to put some cap on the tokens, I definitely want to monitor that very carefully and understand the burn.

**Speaker 8 | 17:52**
I definitely want to monitor that very carefully and understand the burn. So it would be good to get an alert just to understand.

**Wesley Donaldson | 17:58**
So it would be good to get an alert just to understand we finished.

**Speaker 8 | 18:01**
Like we've hit a start, that's for sure.

**Wesley Donaldson | 18:02**
Start with this.

**Speaker 8 | 18:06**
Cool.

**Wesley Donaldson | 18:06**
Cool. I'm interested today in what we have that's worthy of handing over to an investor.

**Speaker 8 | 18:06**
I'm interested today in what we have that's worthy of handing over to an investor on Monday.

**Wesley Donaldson | 18:14**
On Monday, that was my big burning question today.

**Speaker 8 | 18:17**
That was my big burning question today. We had that yesterday.

**Wesley Donaldson | 18:21**
We had that yesterday for everybody.

**Speaker 8 | 18:22**
If you're everybody that was on those calls remembers we have an investor call on Monday and we need to give access to some usable software of some kind.

**Wesley Donaldson | 18:23**
That was on those calls for members. We have an investor call on Monday
and we need to give access to some usable software of some kind.

**Speaker 8 | 18:33**
That's an interesting question because if you give somebody access to something that's not quantum, that doesn't necessarily go over that great, but it's at least access to something.

**Wesley Donaldson | 18:33**
That's an interesting question because if you give somebody access to something that's not quantum, that doesn't necessarily go over that great, but it's at least access to something.

**Speaker 8 | 18:47**
So there's Q Hub code engine.

**Wesley Donaldson | 18:47**
So there's Q Hub code engine, and we could do some demos and things, we can make videos of things, whatever.

**Speaker 8 | 18:50**
We can do some demos of things, we can make videos of things, whatever. And so what are the right candidate systems?

**Wesley Donaldson | 18:55**
And so what are the right candidate systems?

**Speaker 8 | 18:58**
I know, Sam, you were in on that too.

**Wesley Donaldson | 18:58**
I know, Sam, you were in on that too.

**Speaker 8 | 19:00**
So we have PQ ARC like something we can represent there.

**Wesley Donaldson | 19:00**
So we have PQ ARC like something we can represent there.

**Speaker 8 | 19:06**
Have we got a list of the things we're going to make available or have you guys talked at all with Lauren about that?

**Wesley Donaldson | 19:06**
Have we got a list of the things we're going to make available or if you guys talked at all about that beyond what we talked about yesterday?

**Speaker 8 | 19:14**
Beyond what we talked about yesterday?

**Shawn Goertzen | 19:18**
I haven't talked to him beyond what's in the Slack.

**Wesley Donaldson | 19:18**
I can talk to him beyond what's in the Slack board.

**Shawn Goertzen | 19:21**
Right? I know that Michael posted something this morning listing out a sort of agenda with there some of their all goes for T you can see you finance are out to max and then code engine, Qi Hub et cetera and you but Ubridge in there as well.

**Wesley Donaldson | 19:22**
I know that Michael posted something this morning listing out an agenda where there are some algos for finance starting out to max and then codingine BI Hub, etc. by bridge in there as well.

**Shawn Goertzen | 19:44**
So I don't know if we have something we could show in that vein.

**Wesley Donaldson | 19:44**
So I don't know if we have something we could show in that thing.

**Speaker 10 | 19:52**
Yeah.

**Wesley Donaldson | 19:52**
Yeah.

**Speaker 10 | 19:52**
I don't know if there's...

**Wesley Donaldson | 19:52**
I don't know if. If there's anything immediately for Cambridge, we could...

**Speaker 10 | 19:53**
If there's anything immediately for Ubridge, we could... I don't know.

**Wesley Donaldson | 19:59**
I don't know.

**Speaker 10 | 19:59**
It depends on how you guys feel about the state of the QMM work and whether that's something that we can demo.

**Wesley Donaldson | 19:59**
It depends on how you feel about the state of the Q or whether that's a statement you intend.

**Speaker 2 | 20:06**
Or do we have a video already of the CBA demo through MCP?

**Wesley Donaldson | 20:06**
Or do we have a video already of the CDA demo through MCD?

**Speaker 11 | 20:13**
Yeah, we recorded me doing a session with it.

**Wesley Donaldson | 20:13**
Yes, we recorded to be doing a session on...
Maybe that's a good enough artifact just to show an additional piece of work and line that book.

**Speaker 2 | 20:18**
Maybe that's a good enough artifact just to show an additional piece of work.

**Speaker 11 | 20:22**
Right? Probably, I think... I mean, yeah, I think maybe we want to script it.

**Wesley Donaldson | 20:25**
Yeah, I think maybe we were scripted.

**Speaker 11 | 20:31**
I...

**Wesley Donaldson | 20:31**
I gotsh.

**Speaker 11 | 20:33**
Gosh. How much time do we have?

**Wesley Donaldson | 20:33**
How much time to here?

**Speaker 11 | 20:34**
I'm kind of busy today.

**Wesley Donaldson | 20:34**
I'm kind of busy today.

**Speaker 11 | 20:36**
Is there anybody who could take a few minutes this afternoon to interview me while I go over some of these products?

**Wesley Donaldson | 20:36**
Is there anybody who could take a few minutes this afternoon to interview me while I go over some of these products?

**Speaker 8 | 20:46**
Yeah, I can do that.

**Wesley Donaldson | 20:46**
Yes, something...

**Speaker 11 | 20:48**
Good, let's set something up.

**Speaker 8 | 20:52**
Okay, I guess. Can someone send me a copy of the recording of the session that you had when you were going through it?

**Wesley Donaldson | 20:52**
Okay. I guess. Can someone send me a copy of the recording of the session that you had when you were going through it?

**Speaker 8 | 21:04**
CVA.

**Wesley Donaldson | 21:04**
CA Honestly, I thought you were.

**Speaker 11 | 21:07**
Honestly, I thought you were there was.

**Wesley Donaldson | 21:09**
There was...

**Speaker 11 | 21:12**
Okay, let's just do it again.

**Wesley Donaldson | 21:12**
Okay, let's just do it again.

**Speaker 11 | 21:13**
I mean, it was kind of cool, but it's not that hard.

**Wesley Donaldson | 21:13**
I mean, it. It was kind of cool, but it's not that hard. Yes, you were.

**Speaker 11 | 21:16**
Yes, you were. Yes, you were.

**Wesley Donaldson | 21:17**
Yes, you were. You had to give me the Claude st me up the clau.

**Speaker 11 | 21:17**
You had to give me the clauude, set me up with Claude. I remember that.

**Wesley Donaldson | 21:20**
I remember that session.

**Speaker 8 | 21:21**
That session... I don't remember that resulting in you actually doing something.

**Wesley Donaldson | 21:22**
I don't remember that resulting in you actually doing something.

**Speaker 11 | 21:29**
Yes, I got it.

**Wesley Donaldson | 21:30**
Yes, I got it.

**Speaker 11 | 21:31**
I mean...

**Wesley Donaldson | 21:31**
I mean, if you're just doing the example though, you weren't actually... There was no problem, you were actually running.

**Speaker 8 | 21:32**
We're just doing the example, though. You weren't actually... There was no problem, you were actually running, right?

**Nicolas Berrogorry | 21:39**
May I?

**Wesley Donaldson | 21:39**
May I?

**Speaker 6 | 21:40**
Sorry, there is a recording, but where I actually deload the CD IMCP 7 so it's complete.

**Wesley Donaldson | 21:40**
Sorry, there is a recording, but where I actually done on the co mir p so.
So it's concrete.

**Speaker 6 | 21:46**
It might not be of good quality, but you can at least look at it and do the demos again.

**Wesley Donaldson | 21:46**
It might not be of good quality, but you can at least look at it and do the demos again.

**Speaker 6 | 21:51**
Or like the examples like that for of like every feature.

**Wesley Donaldson | 21:51**
Or like the examples. Like. Like every ST.

**Speaker 11 | 21:56**
Yeah, that's possible, but what we discovered was that the...

**Wesley Donaldson | 21:56**
Yes, that's possible, but what we discovered was that the...

**Speaker 11 | 22:02**
So with the cloud code, it was intelligent enough that it was capable of producing a very simple test function and then actually ran the optimization.

**Wesley Donaldson | 22:02**
So with the cloud code, it was intelligent enough. It was capable of producing a very simple test function and then actually ran the optimization. So it was far more impressive than I had thought it would be capable of.

**Speaker 11 | 22:15**
So it was far more impressive than I had thought it would be capable of.

**Speaker 8 | 22:20**
Yeah, I barely remember that, but okay.

**Wesley Donaldson | 22:20**
Yeah, I barely remember that. Okay, yeah, I'll do it again, but better. So send... I'll take your recording.

**Speaker 11 | 22:25**
Yeah, let's do it again, but better.

**Speaker 8 | 22:28**
So, Cedric, I'll take your recording. If you can grab that, give me a link to that.

**Wesley Donaldson | 22:30**
Can you grab that? Can you give me a link that...

**Speaker 8 | 22:32**
There you go.

**Wesley Donaldson | 22:32**
There you go.

**Speaker 8 | 22:33**
Yes, sounds awesome.

**Wesley Donaldson | 22:35**
Awesome. That's good.

**Speaker 8 | 22:38**
That's good. Then we'll go back through this again.

**Wesley Donaldson | 22:38**
And then we'll go back through this again.

**Speaker 8 | 22:40**
That'll be sweet.

**Wesley Donaldson | 22:40**
Be sweet.

**Speaker 8 | 22:43**
So that's something...

**Wesley Donaldson | 22:43**
So that's something, but the question is, actually, there are two sides to this.

**Speaker 8 | 22:45**
But the question is actually there are two sides to this. One is something that could be demoed to them or given to them in a video can to kind of a thing, but they actually want access directly to something.

**Wesley Donaldson | 22:49**
One is something that could be demoted to them or given to them in a video CAM kind of a thing that they actually want access directly to something.

**Speaker 8 | 22:58**
So Ubridge would only be a demo at best, which is fine.

**Wesley Donaldson | 22:58**
So Krisp would only be a demo at best, which is fine.

**Speaker 8 | 23:03**
The CVA a part of that could be that, it's just kind of forward leaning and looking, which is great.

**Wesley Donaldson | 23:03**
The CBA part of that could be that it's just forward-leaning and looking. It's great.

**Speaker 8 | 23:10**
We might make something really canned for Monday, but then there's the... What do we give them unfettered access to?

**Wesley Donaldson | 23:10**
We might make something really can for Monday, but then there's the what do we give them unfettered access to?

**Speaker 8 | 23:17**
Like here, go play with this.

**Wesley Donaldson | 23:17**
Like here, go play with this.

**Speaker 8 | 23:19**
And the only thing that seems to qualify in my brain is you know something?

**Wesley Donaldson | 23:19**
And the only thing that seems to qualify in my brain is, you know, something using Qai Hub as just the download that it is or using code engine, those two things.

**Speaker 8 | 23:25**
Using Qi Hub as just the demo that it is or using code engine, those two things. So providing them with access to those things are the only thing I can think of.

**Wesley Donaldson | 23:32**
So providing them with access to those things are the only thing I can think of, just saying, hey, here you go ahead, log in, go check it out, here's the instructions.

**Speaker 8 | 23:36**
Just saying, hey, here you go as you log in, go check it out. Here's the instructions.
So the question is, "Is it going to fall on its face if they were to do that?"

**Wesley Donaldson | 23:41**
So the question is, "Is it going to fall on its face if they want to do that?"

**Speaker 10 | 23:46**
Yeah.

**Wesley Donaldson | 23:46**
Yeah, you know, it depends on how you're pitching it or how you're pitching.

**Speaker 8 | 23:47**
To get was using this day to day. You know.

**Speaker 10 | 23:50**
It depends on how you're pitching it or how you're pitching TQ because we've got various chemistry libraries, like advanced chemistry libraries that have been put out by T TQ CAM.

**Wesley Donaldson | 23:52**
TQ because we've got various chemistry libraries like advanced chem chemistry libraries that we by TK but that might not align with the interests of these investors or how we're fishing.

**Speaker 10 | 23:59**
But that might not align with the interests of these investors or how we're pitching.

**Wesley Donaldson | 24:03**
TE company.

**Speaker 10 | 24:03**
TE QAs a company.

**Wesley Donaldson | 24:04**
We do want to share those.

**Shawn Goertzen | 24:04**
We do want to share those. The TQ can all of our libraries including Clearview, I would think I don't know how if they'll be able to use them.

**Wesley Donaldson | 24:07**
You can all of our libraries, including Clearview, ever think. I don't know how they'll be able to use them, but if you can Rollman or somebody to be done like a walk through, like in very.

**jessica@terraquantum.swiss | 24:15**
But it does it make sense to engage the TIK Camp Braman or somebody to give them like a walk through like you know he's very engaging. I'm pretty sure he can with him.

**Shawn Goertzen | 24:27**
Yes.

**Wesley Donaldson | 24:28**
Michael was going to have 30 minutes to d all those products, but if we can give them access as well afterwards, that will at least show transparency from our side.

**Shawn Goertzen | 24:28**
Michael was going to have 30 minutes to download those products. But if we can give them access as well afterwards, that would at least show transparency from our side.

**Speaker 8 | 24:42**
Yeah, okay, so that means that we need to issue them a license then, right?

**Wesley Donaldson | 24:42**
Yeah. Okay, so that means that we need to issue them a license then, right?

**Speaker 8 | 24:48**
That's it.

**Wesley Donaldson | 24:48**
That's it.

**Shawn Goertzen | 24:51**
Yeah, but I think for Clearview, we need to...

**Wesley Donaldson | 24:51**
Yeah, but I think for Clearview, we need to...

**Shawn Goertzen | 24:54**
I don't know if we have the new license set up for Clearview, if we need to go with the older license management.

**Wesley Donaldson | 24:54**
I don't know if we have a new license set up for Clearview, if we need to go with the older license management.

**Speaker 4 | 25:06**
I don't know, finish with the key change for...

**Wesley Donaldson | 25:06**
If I'm finished with the key change for...

**Speaker 4 | 25:09**
Do you mean giving them the labric for CVA?

**Wesley Donaldson | 25:09**
Do you mean giving them the debric for CV?

**Speaker 4 | 25:11**
A Linux?

**Wesley Donaldson | 25:11**
AS?

**Speaker 8 | 25:14**
No.

**Wesley Donaldson | 25:14**
No.

**Speaker 8 | 25:16**
So getting them access to do what Ruben did is a different story for CBA, but the TQ Chem stuff would need to issue a license, right?

**Wesley Donaldson | 25:16**
So getting them access to do what Ruben did is a different story for CBA, but the TQ Chem stuff we need to issue a license, right?

**Shawn Goertzen | 25:27**
Yeah, I wasn't talking about what I...

**Wesley Donaldson | 25:27**
Yes. I wasn't talking about what Ruben, you...

**Shawn Goertzen | 25:28**
Ruben, you. I haven't seen your demo, but I'm assuming that was with Ubridge.

**Wesley Donaldson | 25:29**
I haven't seen your demo, but I'm assuming that was with Cambridge.

**Speaker 8 | 25:36**
Yeah, and that was more machine to machine, right?

**Wesley Donaldson | 25:36**
Yeah, that was more machine to machine, right?

**Speaker 8 | 25:38**
So we have a different way of authorizing.

**Wesley Donaldson | 25:38**
So we had a different way of authorizing.

**Shawn Goertzen | 25:41**
I was saying you're just giving them access to the Clearview library just like we would with TQ.

**Wesley Donaldson | 25:41**
I was thinking it was giving them access to the Clearview library just like we would with TQ Finance, TP revenue.

**Shawn Goertzen | 25:46**
Can TQ finance TIK routing?

**Wesley Donaldson | 25:50**
Yeah, good.

**Speaker 8 | 25:50**
Yeah, good. I think whatever's easier.

**Wesley Donaldson | 25:54**
I think whatever is easier.

**Speaker 8 | 25:57**
The demo with Ubridge would be nice just to show that there's some agentic capability, but that's good.

**Wesley Donaldson | 25:57**
The demo with Cambridge would be nice just to show that there's some agentic capability, but that's good.

**Speaker 8 | 26:04**
It doesn't necessarily have to be...

**Wesley Donaldson | 26:04**
It doesn't necessarily have to be.

**Speaker 8 | 26:07**
They wouldn't have to access that way, so I agree.

**Wesley Donaldson | 26:07**
They wouldn't have to access that way, so I agree.

**Speaker 8 | 26:12**
Yeah.

**Wesley Donaldson | 26:12**
Yeah.

**Speaker 8 | 26:12**
So a list.

**Wesley Donaldson | 26:12**
So the list... Let's get a clear list of things we can get access to and make sure that it's a straightforward instruction or a straightforward path to giving them access, whoever that is.

**Speaker 8 | 26:13**
Let's get a clear list of things we can get access to and make sure that it's a straightforward instruction or a straightforward path to giving them access, whoever that is. I think it's... There's one person that we need to give hands-on to.

**Wesley Donaldson | 26:22**
I think it's... There's one person that we need to give hands-on to.

**Speaker 8 | 26:26**
It's not like a whole team or anything.

**Wesley Donaldson | 26:26**
It's selling the whole team right now.

**Speaker 8 | 26:31**
Okay, I'll come up with a two-week send.

**Wesley Donaldson | 26:31**
Okay. Come up with a, two week, set send.

**Speaker 2 | 26:38**
Cedric, if Alexi were to ask the same about TQ ML that's licensed too, right?

**Wesley Donaldson | 26:39**
I'll actually want to ask the same about TQML that's licensed too, right?

**Speaker 2 | 26:44**
Didn't they distribute it to students?

**Wesley Donaldson | 26:44**
Then they distributed to students without... Yes, it's license book just cut.

**Speaker 2 | 26:47**
With obfuscation.

**Speaker 6 | 26:49**
Yes, it's licensed and discounts.

**Speaker 2 | 26:51**
Do you know how much effort that would be if they asked for it again?

**Wesley Donaldson | 26:51**
You don't know how much effort that will be.
If they asked for it again, it'll be prepared maybe.

**Speaker 2 | 26:54**
Should we be prepared, maybe?

**Wesley Donaldson | 26:57**
So just another distribution with a license on it or something so that someone could play with the library hands-on without necessarily seeing it all.

**Speaker 2 | 26:57**
So just another distribution with a license on it or something so that someone could play with the library hands-on without necessarily seeing it all. Did you just freeze or is it me?

**Wesley Donaldson | 27:10**
The NEWSPACE was handsome.

**Speaker 6 | 27:13**
Handsome? Yeah, that's like.

**Wesley Donaldson | 27:14**
Yeah, that's... Sorry for a second, sorry, no, I... Sorry.

**Speaker 2 | 27:18**
Sorry you froze for a second.

**Speaker 6 | 27:20**
Sorry, no, I sorry. Okay, hopefully, this goes through.

**Wesley Donaldson | 27:23**
Okay, hopefully, this goes through. I have this here, I can send it to everyone here.

**Speaker 6 | 27:26**
I have this where I can send it to everyone here. I can upload it to some artifacts that just...

**Wesley Donaldson | 27:29**
I can upload with some aspects of just three.

**Speaker 6 | 27:33**
Yeah.

**Wesley Donaldson | 27:33**
Yeah, and then we would just need a license.

**Speaker 2 | 27:35**
Then we would just need to license and issue a license if...

**Wesley Donaldson | 27:37**
It's a gen license.

**Speaker 2 | 27:39**
Okay, he hasn't asked for it yet.

**Wesley Donaldson | 27:39**
Okay, he hasn't asked for it yet.

**Speaker 2 | 27:42**
I mentioned that to him as maybe a possibility, right?

**Wesley Donaldson | 27:42**
I mentioned that to him. It's maybe a possibility, right?

**Speaker 2 | 27:44**
To give them something quantum and still obfuscate it.

**Wesley Donaldson | 27:44**
To give them something quantum and still obfuscated. Okay.

**Speaker 8 | 27:50**
Okay. Let's just have that ready at the ready.

**Wesley Donaldson | 27:51**
Let's just have that ready at the ready.

**Speaker 8 | 27:53**
That's the way to go.

**Wesley Donaldson | 27:53**
That's the way you go.

**Speaker 11 | 27:57**
Do you have quantum in the code engine?

**Wesley Donaldson | 27:57**
You have ing in code engine and alcode engine is on database but on the coaging is just fine.

**Speaker 4 | 28:02**
As first and now the code engine is outdated, right? Quite...

**Speaker 11 | 28:06**
Outdated. Code engine is just fine. There's no problem running code engine.

**Wesley Donaldson | 28:10**
There's no problem with it.

**Speaker 11 | 28:12**
It's yeah.

**Speaker 8 | 28:14**
We've got you, we've got it. It is

**Wesley Donaldson | 28:17**
Is the funny?

**Speaker 8 | 28:18**
It is funny, though, when you say outdated, Dave, I think everybody feels that way, but it's funny that it's never really been used.

**Wesley Donaldson | 28:18**
It is funny, though. When you say outdated days, I think everybody feels that way, but it's funny that it's never really been used.

**Speaker 8 | 28:29**
I don't think anybody can say it's been outdated because it went into beta, and that's exactly what it is.

**Wesley Donaldson | 28:29**
I don't think anybody can say it's been outdated because they went into beta, and that's exactly what it is.

**Speaker 8 | 28:35**
I think it's a good story that you go into beta and something fails.

**Wesley Donaldson | 28:35**
I think it's a good story if you go into beta and something fails.

**Speaker 8 | 28:39**
To me, it's a win when you don't launch something to production that's not ready for production, you know what I mean?

**Wesley Donaldson | 28:39**
To me, it's a win when you don't launch something in production that's not ready for production, you know what I mean?

**Speaker 8 | 28:45**
It's actually a good story, and the demonstration of the algorithm library is what counts there, because that's all they'd be concerned with.

**Wesley Donaldson | 28:45**
That's actually a good story. The demonstration of the algorithm library is what counts there, because that's all they'd be concerned with.

**Speaker 8 | 28:55**
Okay, well, that means we need to kick the tires on queuing, too.

**Wesley Donaldson | 28:55**
Okay, well, that means we didn't kick the tires on queuing too.

**Speaker 8 | 28:59**
So, Ruben, I'll set up a time for us a little bit later today to talk through some of these things.

**Wesley Donaldson | 28:59**
So we have the time for us a little bit later today to talk through some of these things.

**Speaker 8 | 29:03**
I'll go through this recording.

**Wesley Donaldson | 29:03**
I'll go through this recording.

**Speaker 8 | 29:05**
I'm just gonna get A list of these various things we talked about together.

**Wesley Donaldson | 29:05**
I'm just going to get a list of these various things we talked about together.

**Speaker 8 | 29:09**
Then somehow by Monday, amongst flights and everything else, this...

**Wesley Donaldson | 29:09**
Then somehow by Monday, amongst the flights and everything else, this...

**Speaker 8 | 29:14**
So I'll have to be sitting there ready to go in my back pocket just in case I need it.

**Wesley Donaldson | 29:14**
So I'll have to be sitting there ready to go in my back pocket just in case I need it.

**Speaker 8 | 29:19**
Because I didn't expect to get invited to the investor call.

**Wesley Donaldson | 29:19**
Because I didn't expect to get invited to the investor call.

**Speaker 8 | 29:23**
But I guess I'm getting invited there for reasons.

**Wesley Donaldson | 29:23**
But I guess I'm getting invited there for reasons.

**Speaker 11 | 29:25**
So do you know what time of day it's going to be?

**Wesley Donaldson | 29:25**
So do you know what time of day it's going to be?

**Speaker 8 | 29:31**
I do not.

**Wesley Donaldson | 29:31**
I do not.

**Speaker 8 | 29:32**
That's exactly what I'm asking.

**Wesley Donaldson | 29:32**
That's exactly what I'm asking.

**Speaker 8 | 29:34**
But I'm assuming investor session on Monday means something related to when that where that investor is if they're in Europe, it's going to be midday, I guess.

**Wesley Donaldson | 29:34**
But I'm assuming investor session on Monday means something related to when that where that investor is if they're in Europe, it's going to be midday, I guess, yes.

**Speaker 10 | 29:47**
Yeah. Do we know if it's Europe or Pacific time?

**Wesley Donaldson | 29:47**
Do we Have that to Europe or Pacific time?

**Speaker 11 | 29:51**
It could be New York.

**Wesley Donaldson | 29:51**
It could be New York.

**Speaker 11 | 29:52**
We have no idea.

**Wesley Donaldson | 29:53**
We have no idea.

**Speaker 11 | 29:53**
We have to find out.

**Wesley Donaldson | 29:53**
We have to find out.

**Speaker 11 | 29:55**
However...

**Wesley Donaldson | 29:55**
However...

**Speaker 11 | 29:56**
Okay, let me think.

**Wesley Donaldson | 29:56**
Okay, let me think.

**Speaker 11 | 29:57**
What else do we have?

**Wesley Donaldson | 29:57**
What else do we have?

**Speaker 11 | 30:02**
We have a couple of things that Michael is shy about, which are actually pretty good.

**Wesley Donaldson | 30:02**
We have a couple of things that Michael is shy about, which are actually pretty good.

**Speaker 11 | 30:10**
The missing the name of it.

**Wesley Donaldson | 30:10**
The missing the name of it.

**Speaker 11 | 30:16**
But we have a utility which encodes classical data as quantum states and another one which will encode classical operators as quantum circuits.

**Wesley Donaldson | 30:16**
But we have a utility which encodes classical data as quantum states, and another one which will encode classical operators as quantum circuits.
But no, they wouldn't have unfettered access.

**Speaker 11 | 30:35**
But no, they wouldn't have unfettered access. And. And I don't think it's ready for production.

**Wesley Donaldson | 30:37**
I don't think it's ready for production, however, it's good it's purely quantum.

**Speaker 11 | 30:39**
Yeah, however, it's good, it's purely quantum. I mean, it's actually a worthy demonstration if that's what they want, but I've never run them.

**Wesley Donaldson | 30:43**
I mean, it's actually a worthy demonstration. That's what they want, but I've never run them.

**Speaker 8 | 31:05**
I don't think the demos are going to...

**Wesley Donaldson | 31:05**
I don't think that DES are gonna.

**Speaker 8 | 31:07**
I don't think they're going to have a lot of time on demos.

**Wesley Donaldson | 31:07**
I don't think I'm going to have a lot of time on demos. I think they're just going to want access to something after a short demo, probably.

**Speaker 8 | 31:09**
I think they're just going to want access to something after a demo. A short demo, probably.

**Speaker 11 | 31:13**
So are they actually asking for a demo or are they asking for an inventory of code?

**Wesley Donaldson | 31:13**
So are they actually asking for a demo or are they asking for an inventory of code?

**Speaker 8 | 31:20**
Nope, they want hands-on.

**Wesley Donaldson | 31:20**
No, they want hands-on.

**Shawn Goertzen | 31:22**
I want to try to...

**Speaker 8 | 31:23**
Yeah, it's just like kind of, a question that was asked, you know?

**Wesley Donaldson | 31:23**
Yeah, it's just like kind of the question that was asked, you know?

**Speaker 8 | 31:27**
Hey, if you guys have all this stuff, can I access it and try it?

**Wesley Donaldson | 31:27**
Hey, you guys have all this stuff, and I access it and try it perfectly.

**Speaker 8 | 31:32**
So a perfectly reasonable request.

**Wesley Donaldson | 31:34**
Reasonable requests.

**Speaker 8 | 31:42**
Actually, I'm just trying to access everything right now.

**Wesley Donaldson | 31:42**
I'm just trying to access it right now.

**Speaker 8 | 31:44**
I just want to make sure everything's accessible the way we think it is.

**Wesley Donaldson | 31:44**
I just want to make sure everything's accessible the way we think it is.

**Speaker 8 | 31:47**
So I'll test all that stuff out today.

**Wesley Donaldson | 31:47**
So I'll test all that stuff out today.

**Speaker 4 | 31:52**
If you want to check your app...
I think that was tested.

**Wesley Donaldson | 31:54**
That was tested last week or a couple of weeks ago, or now working again with pretty fine data sets only that might be an option.

**Speaker 4 | 31:56**
Last week or a couple of weeks ago, and now it's working again with predefined data sets only. That might be an option.

**Speaker 8 | 32:05**
Do you recommend that I do this on the int instance or the prod instance or what?

**Wesley Donaldson | 32:05**
Do you recommend that I do this on the int instance or prod instance or...?

**Speaker 8 | 32:14**
Pro okay, do that.
I'm just checking to make sure how logins work and everything.

**Wesley Donaldson | 32:21**
I'm just checking to make sure. Logs are working well since I've been to the prod.

**Speaker 8 | 32:24**
It's been a while since I've been through the prod.

**Wesley Donaldson | 32:37**
Let's hope you guys are looking at this one.

**Speaker 8 | 32:38**
So all of you guys are looking at this one. What? So you said QAA Hub is fine with a new dataset.

**Wesley Donaldson | 32:42**
So you said QAA Hub is on a new dataset.

**Speaker 8 | 32:47**
I know that.

**Wesley Donaldson | 32:47**
I know that. Just be aware we do have logging issues that I encounter with asking you to log in multiple times, which I think you'll see in the second half.

**Shawn Goertzen | 32:53**
Just be aware we do have login issues that I encounter where it asks you to log in multiple times. Nice, which I think you'll see in the second tab. I think it's asking you to log in again.

**Wesley Donaldson | 33:01**
I think it's asking to log in again.

**Speaker 8 | 33:04**
Great.

**Wesley Donaldson | 33:04**
Great, yeah, yeahho.

**Speaker 8 | 33:06**
Yeah. Yeahhoo. Then log in.

**Wesley Donaldson | 33:12**
Okay.

**Speaker 8 | 33:12**
Okay, well, once I go through my rounds here.

**Wesley Donaldson | 33:13**
Once I go through my rounds here, I'm sure I'll have other questions, but, cool.

**Speaker 8 | 33:16**
I'm sure I'll have other questions, but cool.

**Wesley Donaldson | 33:26**
And, you know, I think if somebody got access to this and had the proper kind of canned reference for themselves to how to get started or what to do, they'd be okay.

**Speaker 8 | 33:27**
You know, I think if somebody got access to this and had the proper kind of canned reference for themselves to how to get started or what to do, they'd be okay, you know?
And I think, framing it exactly as it is, these are beta products that didn't make it.

**Wesley Donaldson | 33:38**
I think framing it exactly as it is, these were greater products that didn't make it.

**Speaker 8 | 33:45**
It's fine too.

**Wesley Donaldson | 33:45**
It's fun too.

**Speaker 8 | 33:49**
Okay, thanks for that.

**Wesley Donaldson | 33:49**
Okay, thanks for that.

**Speaker 8 | 33:53**
I'm sure I'll be asking more as we go into Monday.

**Wesley Donaldson | 33:53**
I'm sure I'll be asking more as we go into Monday, and I don't know the timing, but that's coming soon, apparently, so we'll find out.

**Speaker 8 | 33:56**
I don't know the timing, but that's coming soon, apparently, so we'll find out.
Yeah.

**Wesley Donaldson | 34:02**
Yes.

**Speaker 8 | 34:03**
So, in other news, we have this thing underway with you guys at Zolio.

**Wesley Donaldson | 34:03**
So, in other news, we have this thing underway with you guys as audio. Have you actually talked to the team about the latest updates?

**Speaker 8 | 34:20**
Have you actually talked to the team about the latest updates?

**Speaker 2 | 34:26**
We just chatted a little bit about yesterday's meeting and the QMM simulation inject test again process.

**Wesley Donaldson | 34:27**
Not a little bit aboutsay and Q simulation inject test again process.

**Speaker 8 | 34:36**
Okay, yeah, there's a lot of work going on there.

**Wesley Donaldson | 34:36**
Okay, yes, there's a lot of work going on there, and obviously, I gave you guys a lot of homework.

**Speaker 8 | 34:39**
And obviously, you know, I gave you guys a lot of homework yesterday, so I look forward to seeing more from that next week.

**Wesley Donaldson | 34:44**
Yes, exactly. I look forward to seeing more from that next week.

**Speaker 8 | 34:50**
Availability is going to be really sporadic.

**Wesley Donaldson | 34:50**
Availability is going to be really sporadic.

**Speaker 8 | 34:52**
You already know that because my flight's tomorrow night, and I'll be on the ground Sunday night in unnich time, so.

**Wesley Donaldson | 34:52**
You already know that because my flight's tomorrow night, and I'll be on the ground Sunday night meeting time.
So, Jeff, do you...?

**Speaker 8 | 35:05**
Question, yeah.

**Wesley Donaldson | 35:06**
Yeah. Do you want to just get ahead of...? If we don't... If we know we're not going to have time for the architecture meeting or the demo call, we want to just find a time that works. Or just punt them to the following week.
It's... There's a good amount for us to chew on from the conversation yesterday. As you rightly called out yesterday, we're probably not going to have something super visual, but thinking we should definitely have to share. We can do that. Interact asynchronously as opposed to a demo call.
Yeah, video of yourselves and then post it to everybody that's in that meeting because we'll be at the offsite, so I don't think I can really predict what the timing will be.

**Speaker 8 | 35:34**
Record a video of yourselves and then post it to everybody that's in that meeting because we'll be at the offsite, so I don't think I can really predict what the timing will be, but we should probably just punt it otherwise.

**Wesley Donaldson | 35:44**
We should probably just punt it otherwise.
Yeah, so go ahead and just record.

**Speaker 8 | 35:47**
So go ahead and just record what you...

**Wesley Donaldson | 35:48**
What you've got is if you're having a meeting, we'll put it up there and we'll look at it when we can.

**Speaker 8 | 35:49**
What you've got is if you're having the meeting, put it up there and we'll look at it when we can. Yeah.

**Wesley Donaldson | 35:55**
Yeah, awesome.

**Speaker 8 | 35:56**
Awesome. Okay, what else is happening in the world here?

**Wesley Donaldson | 35:59**
Okay, what else is happening in the world here?

**Speaker 8 | 36:03**
Miro, has it been your first few days, man?

**Wesley Donaldson | 36:03**
Miro? It hasn't been your first few days, man, but yeah, getting to know everyone, jumping into the action.

**Nicolas Berrogorry | 36:08**
Quite well, yeah, getting to know everyone, jumping into...

**Speaker 11 | 36:13**
The action.

**Wesley Donaldson | 36:14**
Yeahself cool.

**Speaker 8 | 36:16**
Cool. Jan, Philip, and Sean, have you met Mario already?

**Wesley Donaldson | 36:18**
Jan, Philip, and Stefan, and you met Mario last week.

**Speaker 8 | 36:21**
Last week. Yeah, I'm hoping that...

**Wesley Donaldson | 36:24**
Yeah, I'm hoping that...

**Speaker 8 | 36:26**
I'm hoping at some point, if you don't know about Deviz Mario, that you can spend some time with those guys, just talk to them, and you guys just mingled.

**Wesley Donaldson | 36:26**
I'm hoping at some point, if you don't know about Deviz Mario, that you can spend some time with those guys, just talk to them. You know. You guys. Just mine. Mill I don't know.

**Speaker 8 | 36:38**
I don't know, Brian, you probably already mentioned that, but it was just something that was on my mind.

**Wesley Donaldson | 36:39**
Brian Proger mentioned that, but it was something that was unknown.

**Speaker 8 | 36:44**
Cool.

**Wesley Donaldson | 36:44**
Cool.

**Speaker 8 | 36:44**
Well, I'm not going to belabor this week.

**Wesley Donaldson | 36:44**
Well, I'm not going to belabor this week.

**Speaker 8 | 36:47**
We have a lot to do to get ready, so, if anybody has any more topics, you're welcome to bring them up.

**Wesley Donaldson | 36:47**
We have a lot to do to get ready. So anybody has any more topics, you're open to bring them up?

**Speaker 8 | 36:53**
Otherwise, I'll give you some time back.

**Wesley Donaldson | 36:53**
Otherwise we'll give you some time back.

**Speaker 8 | 36:57**
Yeah, let's get it.

**Wesley Donaldson | 36:57**
You know, let's get twenty minutes in everybody's pocket here and we appreciate it.

**Speaker 8 | 36:58**
Let's get 20 minutes in everybody's pocket here.
Really appreciate it. Sorry for being so late.

**Wesley Donaldson | 37:04**
Sorry for being so late.

**Speaker 8 | 37:06**
As usual, get overwhelmed by requests of kind.

**Wesley Donaldson | 37:06**
As usual, get overwhelmed by request kind.

**Speaker 8 | 37:10**
I don't even want to share here.

**Wesley Donaldson | 37:10**
I don't even want to share here because you guys get sick to your stomach.

**Speaker 8 | 37:12**
Because you guys get sick to your stomach. But.

**Wesley Donaldson | 37:16**
But thanks a lot, everybody.

**Speaker 8 | 37:17**
Thanks a lot, everybody. Appreciate your time.

**Wesley Donaldson | 37:18**
Appreciate your time, Ruben.

**Speaker 8 | 37:19**
Ruben. We'll be talking a little bit later this afternoon.

**Wesley Donaldson | 37:20**
We will be talking a little bit later this afternoon.

**Speaker 8 | 37:23**
So, you guys.

**Wesley Donaldson | 37:24**
Thanks all. Have a good weekend. Good luck next week.

