# Engineering Roundtable - Mar, 20

# Transcript
**Wesley Donaldson | 00:12**
Thank you.

**Jeff | 00:17**
Okay, well, let's do something. So first of all, any round table topics besides what I might bring today, anybody raise your hand, that's something to talk about. Say so now. Okay, so you guys got to start bringing topics. This is a round table, remember? I want to take some mystery out of one of the things that tends to be seen as a little mysterious, and that is running on quantum computers.
You see me clear all my stuff just to make myself honest here. Here we go. Okay, so I just have a mini little demo here just to show what's up. It's really nothing special because it's all about this is an API key we have. I just generated this for the demo. I can generate a specific API key for anybody. Obviously, I was checking my system and stuff like that, so I'll pay attention to this stuff, but this just shows if we're connected or not, right?
So give me this error, and then I'll say connected. Not an error, but a warning. Then basically I want to know what backend I'm running on, so I want the name of that backend. Now what I've connected to.
If you can see up here. I've got a CRN number. Let me go grab that. There's...

**Brian | 02:01**
Hey, Jeff, I don't know if he said it and I missed it, but I think based on this, you're doing this on the IBM platform.

**Jeff | 02:08**
Yeah, I'm actually even further, I can find it. There we go. Here's where we are. This is the IBM platform. Let me just give you some orientation to this a little bit so you can see here workloads that have run. This is the one I ran just before the meeting. Just to do this demo really quick. I can see it all took two seconds. Multiple U instances. We can go off and look at all of them if you want to.
I think I have all of them here somewhere, do I? And that would be nice anyway. We can just do this and see what happens. But each of these has different configurations. You can see in this configuration, for instance, on IBM in Boston, it's 156 cubits. There are levels of access for pay as you go.
That's all we care about in terms of getting in there. What I did with my Krisp runtime US East, that's basically just picks the most available one, the one that's next up in the queue for you to access based on your location and where you're requesting from if you're in that region.
That's what I did. I got Pittsburgh. So that tells you how I got that one. I didn't name that specific one, but I could have. There's a lot more to how this information means about the performance of the machine and all that kind of stuff. Let's not get into that.
But basically, you have all these CPS you can select from, and they're all real. These are not simulators. They don't do the simulator thing. They rely on you to run simulators locally. You can see I've got a number of API keys I've generated here, but there's all kinds of crazy stuff in here that you can look at in this notebook. What I've done is I picked that particular instance I've run there, I've connected, and that's where I am. IBM Pittsburgh. Now I'll just get here's a really simple circuit just to show that something will run there.
Okay. So boom. But here's something that's going to give us a status on a job as we run it. That's one of the things that a perspective orchestration application that we have to do.
If you're running a job here, you need to check whether it's queued, whether it's running, whether it's initializing, or whether it's complete or done. Those are the four different states you get from this back.
So if I just run this and then I just run status, you'll see it's queued. If I run this again, you'll see it's running. Run this again. It's still going to be running for a bit, but it won't take that long. Come on. It should be faster, miss.
Anyway, you can see. I can keep checking the status, and it will give me a live update. That's what we would have essentially for polling for an application to see if it's complete or we just wait for you if we... Depends on how we ran it and what we ran and got a response back, but nothing really complicated here. What a job I'm running here. This super simple job isn't going to cost a lot.
It's going to take probably two seconds. I'm hoping that it will update here, and we'll see it, but I guess it has to complete first. Shit. All right, well anyway, there's my demo. Isn't that great?
It's not hard. I can give anybody an API key. The tough thing here is we don't want to run things that cost a billion dollars, and they will cost a billion dollars really easily. Two seconds is nothing.
That's fine. We can run lots of those. We're not going to be breaking the bank that way. But the limit on the jobs is a total of two hours and 46 minutes. If you go that much, that's where you run into the fifteen thousand euro plus, I don't know if the job will ever finish there.
It is done. So the job's done, and that means it should be here. There it is. What did the job do? All that kind of stuff is here. Basically, all these measures you could have if you wanted them based on what you did, etc., nothing crazy.
Then you have the job results right here. There you go. Really straightforward stuff in terms of the job that I ran. But if this was a very complicated job with a complex circuit or something like that...
It would probably look a lot more complex, and you'd have data to download. You'd probably have to pull the data down and all that kind of stuff. Okay, any questions? Do you guys want to explore anything that I was showing you or do something else?

**Brian | 07:28**
Did that one say it just took two seconds? It just happened to be like the orchestration of it all took longer. Yeah, so it I'm I'm asking more like, yes.

**Jeff | 07:42**
Sorry.

**Brian | 07:42**
I'm sorry.

**Jeff | 07:44**
Yeah, when it gets to when it gets queued, the status of queued is nothing's happening. It hasn't connected to the computer and actually provisioned the job to that queue yet when it's running. That doesn't mean that the queue is processing it means it's in the process, like you're saying, of orchestrating it in line to get onto the queue to run and then come back with an answer.
So that could take an indeterminate amount of time. That's one of the things that's really confusing is that you'll get a status of running and you'll be like, "Shit, it's been running for an hour." No, it hasn't been running for an hour.
It's been provisioned to the queue to run for an element and the only thing it knows is that it's running. Then when the status changes to done, then it will know that it's done. But the actual run time on the queue for you is two seconds.

**Brian | 08:35**
Is there in terms of managing costs, do we have a sense that they just charge us based on the actual runtime of an application? Is it even possible that the same circuit could take four times as long?
Do we get billed for what actually happens? Or do they try to somehow estimate the cost based on the input? Right? What kind of controls do we have over capping our spend?

**Jeff | 09:09**
A really great question. So I can only refer back to the incident that I ran into where a job ran not the right job, not the one that actually cost $15,000 that we actually wanted to run that ran for that long.
But I tried to run a job and it went into a really weird state on IBM where they said it was running and it was actually a bug and a failure in logic on their side. But they charged us ￢ﾂﾬ15,000. So I went to the max and they charged us...
So their default is to charge you first and then work it out in support. That's what happened to me. Because I had to prove to them that... I will not prove. I had to indicate to them... Look, there was a problem with this job. It didn't run. You guys charged me 15 grand for two hours.

**Wesley Donaldson | 10:02**
OB.

**Jeff | 10:06**
But it definitely didn't run, and it shouldn't have run as long anyway. It took them two weeks. They investigated it and came back and said, "We've credited your account." So that's what happened.

**Brian | 10:18**
Maybe something has changed since then too, but that seems to imply that they try to charge based on what the hardware is actually doing. So if there's a chance that there's variability in what the hardware does with the same input, even we're a little bit at the mercy of...

**Jeff | 10:33**
What do we know? We're at the mercy. But the good news is since it's technically an invoiced account, they can invoice us for the amount. The only thing that would happen is they'd get to a place where it's like, "You didn't pay your invoice."
And we'd be like, "Well, there's 15,000 euros that we don't owe you on there." And they'd say, "Well, we don't know that yet." Then we get into some kind of thing. But I think their system must be better by now because there's no way that they had that situation that they had in the very early days. Those were early days when they must have just had a handful of people running stuff on their computers at that time.
Institutions weren't even... They're not... They're still not really doing that. It's more like academia and students and their own internal guys, but that was clearly something they hadn't run into before.
That's funny.

**Speaker 4 | 11:39**
Two questions. The first one, did you see a cost estimator on the platform?

**Jeff | 11:47**
It's not... I don't know. It's a great question. I don't know if there is a cost estimator.

**Speaker 4 | 11:54**
Then the second question, and you might be able to answer this off the bat, but last time we were running PU jobs on IBM, I recall that the queues were outrageous and there just wasn't any availability. Are you noticing that the trend is different? Or is this kind of...?

**Jeff | 12:12**
As I haven't had any issues with getting to run on a quantum computer, but it's a time of day thing and a day of the week thing. From what I know, so it all depends on when you're running it, because I did see a logjam on certain instances.
Of course, as you saw, we can switch instances on demand, and there are a lot more instances than there used to be, so that makes it a little better. That's why I went with the US East, kind of like the random whatever one is available one approach, because that's the safest approach that you're going to get the first available machine.

**Speaker 4 | 12:54**
Okay. But we can basically assume that there will be an available machine if we try and run a job rather than the way it was seven or eight months ago where there was just nothing.

**Jeff | 13:04**
Yeah, I mean, there's another bit about that, which is we're on the pay-as-you-go plan, and our priority level is "pay as you go," first come, first serve, etc. There are two tiers above that, and they cost a lot of money. The very first one is 30,000 euros minimum spend per year, which we probably would be using if we had customers and all that kind of stuff.
But that's the first tier where you get to reserve time, and then the next one is where you have dedicated time. So nobody can... It's not reserved time, you have a dedicated direct connection to a computer that's guaranteed to you because you're an enterprise and you have...
You're spending 250,000 euros plus a year. So those are the ways you get into that and get more priority. That's a nice problem to have, obviously. One thing to note: they don't really have a cost estimator because they just give you here's how much it costs for a second of runtime, which is a dollar and sixty cents.
So if you're in for a minute and pay as you go is $96 and the flex and the premium are those two other tiers I talked about. They're less costly. So the flex would be $72 a minute and premium is $48 a minute, literally half of what it would cost for pay as you go
but they know they're going to get their money, and you're billed for runtime duration. So it's not about how many shots or gates or any of that stuff you have, it's all about the duration of time you're running on the instance. That makes sense.

**Brian | 14:56**
Then what? I think you just submitted a circuit and an open-source format or something like that. Do they have simulators too, right? Or did those all go offline? Did you say previously?

**Jeff | 15:10**
I was wondering about...

**Brian | 15:12**
Just to simulate.

**Jeff | 15:14**
No. They made a specific decision to take their hosted simulators offline and tell everyone you must now run simulators locally. So they don't even run simulators hosted anymore. So everything we were running on here, all these instances are live native QPS.

**Brian | 15:38**
IBM hosted, but I've used it myself. Krisp kit probably has simulation functionality, right?

**Jeff | 15:45**
Totally. Yeah, the air is called AIR or IRE is a simulator, and we've been using that for the QMM stuff, but you can just run it anytime you want to locally.

**Speaker 4 | 15:59**
Yeah, from what I...

**Jeff | 16:00**
Can run it on your own hosted. I'm sorry, go ahead.

**Speaker 4 | 16:03**
Sorry. I think we had a couple of simulators at least in the... Didn't we? There was IBM Cirque, I think.

**Jeff | 16:11**
Although I...

**Speaker 4 | 16:13**
On cue, yeah, but they wouldn't necessarily be... You might have to find some kind of cross compiler.

**Jeff | 16:23**
Yeah. I mean...

**Brian | 16:24**
I think maybe they weren't really even simulating their hardware. Maybe they were just wrapping it.

**Jeff | 16:33**
IQ is really weird. I think they must get most of their traffic and most of their jobs are running through Amazon or something, but we haven't run anything there. Since what I'm looking at here, February of 2025.
I think this is the last time anyone ran on my API keys, at least against this. You can see the back ends here. Here's their different back ends on Ion Q. Notice how only one of them is available Forte.
Well, Forte is not available to everybody, so you need to get into the program that they allow you to request a reservation. So you need to reserve a space on there to run. All their other backends they have going here, it's typical for them just to be down and offline and all that kind of stuff. I had nothing but problems. Do what's that?

**Brian | 17:47**
Sorry, I just said almost an eleven-hour queue time too on that one.

**Jeff | 17:51**
Right? Right, exactly. You have to reserve and be approved and all that kind of stuff. The stimulators are different. The simulators here that they host, they're pretty reliable and they're always up and running.
So that's what most people run against. In fact, I've had folks from the Q ML team say, "Yeah, we've done stuff on quantum computers and so on and so forth. And I said, "You did?" I don't see any of your jobs."
They're like, "No, we ran it and I found it on the simulator." So they're not running against native use for the most part. As you can see, there were several jobs that have been run here a long time ago,
back in April of 2025. I don't know if that was me, Florian, or maybe it was just me and Reuben messing around. I don't know, but that's probably what it was. I think this was actually me and Reuben messing around.
So there's not a lot of people that are pushing jobs out to these things that I know about now. These are the jobs that ran too. You'll see here. This is, in this case, just a test. You have to see who ran what. There's not much to see.

**Nicolas Berrogorry | 19:20**
I'm happy to see the big stream output with a shot count. It's very similar to the graph that we pivoted to on the...

**Jeff | 19:33**
Yeah, I mean, we could definitely run here. I think the costs are synonymous, so it's not really going to save money or anything like that, but it's just interesting. The other ones we can run on, we can do stuff through a bracket, obviously, but I haven't seen a lot of differentiating between running on one of these devices, for instance, which is a trapped ion device, and running on the IBM platform, which are superconducting devices.
Honestly, that shouldn't matter to us at this scale because trapped ions are typically much slower than superconducting GPUs today.

**Wesley Donaldson | 20:24**
Four?

**Jeff | 20:24**
When you're talking about speed and processing, really big jobs and things that actually need to do massive calculations and combinatorial stuff that quantum computers are good for, that matters. Especially time and latency and all that kind of stuff.
Trapped ions, probably, according to what I've read and what Florian told me. And everything won't be catching up anytime soon. Just superconductive PPS. There are other types as well. Obviously, there are quantum machines, the ones running on D-Wave primarily that everybody uses and overuses.
If anything, I don't think we have any jobs to run on D-Wave machines that I know of. I've never seen an optimization problem that was set up to run there, and I don't know of anybody in our company that's run there on the D-Wave.
Maybe somebody's done it as a student or something like that, but I don't know. I don't have access to that platform. I don't know why, but it was really hard to get access to them when I tried. I could go back and try again. I'd like to see stuff running against IBM really just to prove that we have things because it's a known factor, it works, and it's really well supported. We have a good invoicing set up there.
That's where I'd like to see things running and have people tell me, "You know what? This IBM stuff is crap. We need to run over on IBM or something." Then that's what I'll care about right now. I don't really care.
I have two different providers we can run on reliably and well. One actually that we can run on reliably because, as I said, on D-Wave you only have that four-machine. So it's interesting. It'd be really good to be able to get to the point where we're doing benchmarking or something that shows us a limitation on one of these providers that we can't deal with. Or there's a specialized provider like it is where you run certain types of jobs there that are really best run there and only really could run there.
So there are certain computers or certain quantum computers that are suited for specific types of jobs. Again, we're not doing any of that. So we're just doing meat and potatoes stuff. Why am I saying meat and potatoes? I'm fricking it's vegetarian.

**Speaker 4 | 22:59**
Any hey Jeff.

**Jeff | 23:00**
The second day in a row.

**Speaker 4 | 23:01**
Cheese and potatoes. Quick question. I can't remember the last time we had looked into this, but AWS bracket. Do we have access with them? Because they have quer and regtti in IQM and Ion q and a QW.

**Jeff | 23:20**
We do. What we don't have is a reliable invoicing setup with bracket that could deal with things like people running crazy jobs. We have a credit card against it of us. So my concern with anybody running through bracket is first of all, why because it'd be really good to know why you need to go to Quera or any of the other providers.
What you're running there is different than what would run on IBM but second, because of that billing setup, I just have what I would want to really be in control of what ran there. If we did need to run at volume or need to attach it to one of our applications, then I'd set up a different invoice.

**Speaker 4 | 24:13**
Okay, yeah, it looks like they've got a pay-as-you-go setup similar to IBM.

**Jeff | 24:16**
I don't know whether... Yeah, we know bracket really well, we've looked at it in a lot of detail. We tested the hell out of it, and everything there works for the most part. Although the connection into bracket is very suspect. It doesn't work the way they say it does.
But everything else seems to be good there. The big difference is you're paying AWS, and if something goes wrong, they're not going to support you. The PU, they're just a go-between, right? They're just basically giving you a portal to run an API key, which it's not anything special, honestly.
It's like TQ 42 if you think about it. It's the same deal. You go in and you can do stuff there, but to connect up and they're going to help you with job monitoring and that kind of stuff.
But I at least to me, there must be some advantage to doing it. That's just convenient because people are already on APS. But other than that, I don't know what the real reason you would want to run there unless it was just...
That's the only way you could get to a certain provider. Because Brighetti says that's the only way you can get to them. Well, you go try to get to them through bracket, it's almost impossible. If you look on there, you'll see they have a schedule of availability on bracket, and it's different than what the native providers actually provide.
So they've agreed to some kind of schedule of availability to bracket. It's not the same as if you go to direct, which is one of the reasons we were originally accessing Ion Q directly through their API key because you could do it through bracket and that was fine.
But their availability was not very great and so went over and looked at Ion Q and their availability when they had machines running at that time had no restrictions. So there were no restrictions on IQ and bracket. It was like Tuesday, Wednesday and Thursday, between these hours.
So that's one of the things that was a little weird about Bracket that didn't make any sense in the beginning.

**Nicolas Berrogorry | 26:25**
Do you know if there's any way to cancel? Ay, no.

**Jeff | 26:29**
Go ahead.

**Nicolas Berrogorry | 26:29**
Go ahead. I had a simple question. Have you tried canceling a show? Does it prevent the cost to continue ramping up?

**Jeff | 26:42**
Only if you are still in the queue? You can cancel the job if you're out of the queue. Game over. Yeah. So if you make a mistake and you have an infinite loop.

**Nicolas Berrogorry | 26:59**
That's insane. Yeah, that's that.

**Jeff | 27:03**
But we could...

**Speaker 6 | 27:06**
Maybe we could find out if there was an infinite loop in a simulator already. So, can we do damage control by running it in a simulator?

**Jeff | 27:15**
Exactly. You always should run in simulators prior to running on native cubes for that exact reason. That's one of the reasons that it's so important to have that process in place and have a demand that it's done. In fact, I can't remember which particular provider I was speaking to, but their process was very manual.

**Wesley Donaldson | 27:31**
Yeah. It. It.

**Jeff | 27:39**
You needed to run in a simulator, capture your results, submit the results and the type of job you are running to them for consideration, and only then, when they reviewed your results and determined on merit that you were ready to run on their machine, they would schedule you for Wednesday.
That's the way that particular provider worked. They're a small provider in Europe. I can't remember who they are.

**Nicolas Berrogorry | 28:03**
But like asking for half a telescope time, something like that.

**Jeff | 28:08**
Pretty much, yeah. Or JWST, which you just schedule two years in advance or whatever. But yeah, it was like a committee review or something really weird, but that's the right process. You definitely should run with confidence on simulators and look at the results and evaluate what might go wrong there.
Then you're off to the races. If you haven't evaluated it correctly, or if you did something that's going to show up at a QPU that didn't show up there, I don't know what it would be. But yeah, as I said, I ran into an early problem with IBM, and I don't think they'd ever seen that before.
I don't think they'd ever seen that before. Certainly, I didn't expect that it got logjam somewhere in the process of running, but it wasn't actually running, and it charged me for that time, which makes no sense. It's a very interesting thing because it's early days. There's not a lot of nice-to-have tools.
The cost estimators are like, "Here's how much it costs for second, good luck to you." It's really straightforward in that respect because they don't know how long your thing's going to take to run and neither did you a lot of times.

**Speaker 6 | 29:26**
But like is the one time on the simulate are not comparable to the one on the P actually like there's no correlation.

**Brian | 29:34**
I think that's a challenge. I agree that that's the pattern, but as I understand, decoherence is still an issue, right? It loses its quantum superposition all the time, and that contributes to the error rate.
So that keeps happening in the hardware. I don't know that you model that the simulator, right? If it just keeps failing in the same way... I mean, someone might know more about this than I do at this point, but I wonder if they publish error rates or something like that because I think that all contributes to something we can't really control but are at mercy to for billing.

**Jeff | 30:05**
Well, remember that the simulators are built to act like the native QPUS. So the decoherence you're talking about, some of that is factored into the simulators. I don't know how it's factored in there, but I do know it's in there because we're getting error rates back that continually increase.

**Nicolas Berrogorry | 30:26**
So the noise sweep itself, for example, in the. In the simulator node, like, we can tune the noise, range that we send to the simulator. And, I think it's internal to a simulator. Yeah.

**Speaker 7 | 30:42**
We did the same at Camera. When developing the simulator, we had a noise model where we just had actually three different variables we could tune to simulate the coherence on certain devices. It was pretty basic, but it worked and it tended to actually fit the actual device.

**Jeff | 31:06**
I'm very interested, Mario, because if I think about what the next steps we should be looking at here, in my opinion... That's just a very limited, narrow window, in my opinion. I want to see us flex the muscles of these machines somehow. I want to see us come up with a problem that, unlike Florian, takes two hours, but something that really pushes the QPU so that it's not a two-second job, but it's more like ten minutes and something that's really challenging and shows us some of the stresses we might see. I'm just really more interested in not the benchmark side of it, but I'm just interested in understanding how to deal with these jobs better.
I'm wondering what kind of jobs we can run that vary like that in complexity and depth in the expected time it would run all of those things. Doing exactly what Brian was suggesting, which is "Here's how it ran on the simulator, here's how it runs on native. Let's look at the difference with these things and understand that difference."
That's what I'm really interested in. How can we say to somebody, for example, "Given what the tour is talking about, you run QMM, it optimizes your circuit, and it's going to give you a 30% reduction in run time and costs."
That's what it tells us on the simulator. Now you run it on the IBM native QPU, and it's only an eight percent reduction. I'm really interested in those kinds of things.

**Speaker 7 | 32:57**
We had... I think we really haven't embarked on it. We had a tool that generated various circuits. Not really useful ones probably, but configurable in terms of depth and length with different settings where we could define how much entanglement, how many gate courses in between entanglements, and a lot of variables. Just to do something exactly like this where we said, "Okay, we can sign this." With, for example, Krisp kit, we get this and this specific noise model, we get those results.
Is this reflected on the hardware? This was actually one of the things we used to tune our noise model to be in line with whatever other device we'll be expecting. I don't know if there's a...

**Brian | 33:52**
I mean...

**Speaker 7 | 33:53**
Yeah, this. If you're not interested in benchmarking, this is maybe not the right approach, but it was at least something where we could then afterwards tell if our estimation of the device or our noise estimation is comparable.

**Jeff | 34:11**
Yeah, that's a really interesting thing to do. That's good. A known set of results that should come back constantly running them to know about circuits. It's probably worth talking about that in this group.
I think maybe... Nicolas and Dominik, you had that database of circuits that you're storing stuff in, right? You got those circuits from... AI forgot what you said, like some platform tutorial place.

**Nicolas Berrogorry | 34:54**
The Munich Quantum.

**Jeff | 34:57**
That's right. Yeah, I'm just... I'm wondering when we did... Did you do any of that stuff? Or did you guys do any of that? Mario, where you were trying to understand which particular types of circuits were optimal for a particular job, or if you were...
If you had a circuit that was introduced comparing it against a database or some array of circuits to see if there were similarities or advantages or anything.

**Speaker 7 | 35:35**
Not at all. We had oil circuits we used for specific problems were handcrafted and fit for exactly whatever purpose they had. So I think...

**Jeff | 35:49**
We...

**Speaker 7 | 35:51**
Basically always or started with a clean circuit and then built up whatever...

**Jeff | 35:56**
We needed. Did you guys ever get to...? I remember there were talks within Vidia about getting one of their devices actually installed and running. Did you ever make any headway there?

**Speaker 7 | 36:15**
I think we got at one point access to their. They had like this very short initiative where they pushed like this N Vido quantum simulation cloud stuff. I and I think we had access for some time, but, the next iteration would be that we would take one of the NVD DGX machines.
I think they record. Yeah, and run the their quantum stack on those machines. But this never happened.

**Brian | 36:48**
That's just simulation, right?

**Jeff | 36:50**
Yeah, well, not the DGX device. Sure, I think...

**Speaker 6 | 36:58**
Yeah, I think...

**Jeff | 36:59**
That is...

**Brian | 36:59**
Just about memory, isn't it?

**Speaker 7 | 37:01**
Yeah, my understanding was that this was just simulation. They had some plans to develop an LVM intermediate representation for quantum tech, but I haven't seen this be mentioned anywhere in the last year and a half, I think.
So... I don't know.

**Jeff | 37:22**
If I thought there was another advantage to that device, though. I thought that device was set up so that it was in a network that was connected in a hybrid sense, and that it was all about managing and reducing latency.

**Speaker 7 | 37:41**
It sounds familiar, except for the hybrid part. But, yeah, maybe there's a different kind of...

**Jeff | 37:47**
Like that it's sad in as sad in a, in an environment with, you know, where you had connection to. Well, yeah, I mean, maybe it was a dedicated environment, but I just remember it being about orchestrating and helping to manage and reduce latency.
Like down to 400 ns or less or something.

**Brian | 38:10**
That would make sense, right? Like in terms of not being over a network over a REST interface like everything else, if you offload the simulation to GPUs basically, then you have your CPU still for your classical, and that interface is lower latency than everything else.

**Speaker 7 | 38:25**
Yeah, I think the whole idea was based around this Hopper architecture where they had their own ARM chips running basically on the same memory as the GPUs they had and interacting directly or being able to handle some stuff directly on the GPU memory from the CPU.
Yeah, I think it was that architecture.

**Jeff | 38:52**
You know, I saw an amazing PowerPoint slide from some company called Q Mware where they were supposed to combine the memory from CPUS and PUS I thought that was amazing, the shared memory. It's amazing.
You know, I was sitting with the founder once in San Francisco Talkcket, and he asserted to me that it was like, the best thing ever. And so I asked him, you know, do you have tests for that? And he said he would get back to me.

**Speaker 7 | 39:17**
So has he gotten back to you now?

**Jeff | 39:22**
Later on, during that same conversation, he admitted that they didn't have tests. But I'm joking because for a long time, QMware was talking about this thing about shared memory and waving their hands and showing it on slides and everything else, and it didn't exist.

**Wesley Donaldson | 39:28**
[Laughter].

**Jeff | 39:42**
It's really weird. Anyway, fun days. Anyway, this is the space we should be familiar with. The reason that I'm showing the quantum computer and how to connect to it today is that I don't want anyone to feel intimidated.
If you do need an API key, I'm completely fine with you having one under the condition that you do exactly what Brian said. Run your job on a simulator first. When you're going to run jobs, make sure that you have some kind of clear status check included that you know the name of the CRN or you know the CRN number that you're running on. I just want everything to be clearly documented, who's running what when, all that kind of stuff, just in case we run into problems.
But it's just extreme caution that should be used, and it should only be run when you really need to run on that native queue for comparison. If you just want to test it out and make sure it works, that's fine too.
So that's open to you guys, Xolv or anybody else here who wants to run against IBM. Just let me know and I'll generate you a key.

**Nicolas Berrogorry | 41:01**
Okay, I can see us trying the short algorithm now that we can see the output and see that it's working on the simulator. We can see if it's working on the real hardware.

**Jeff | 41:12**
Okay, I'll just give you a key. Then I'll just give you the same key that I just generated. Run with that.

**Brian | 41:19**
Nicolas just wants to crack encryption as his first experiment.

**Nicolas Berrogorry | 41:23**
No, I already... So, yeah, the reason I went for sure was because it was one of the classically verifiable ones. But then I continued researching, like the scope, and I found that to crack a real encryption key at this point, we can't do it with existing hardware. We need a little bit more cubits.
It's like 4000 cubits, and I don't know how... It's a huge depth of circuit that you need, because the SIRD is specific to the number that you're trying to crack, so that's interesting.

**Brian | 41:55**
You... I'm just giving you a hard time. Sounds like a good idea.

**Jeff | 42:01**
Would you start drinking? You die sooner.

**Speaker 6 | 42:04**
I just said... You need a lot of money.

**Nicolas Berrogorry | 42:08**
Can you imagine the time?

**Speaker 6 | 42:11**
After a few days?

**Jeff | 42:13**
Still not finished. You can just build your own custom computer, so it's much less expensive, right? Maybe... Okay, so the next steps are I'll get you an API key. Nicholas just read a test that's cool. One really interesting thing for me is, "Do we have...?"
Maybe Anya, you've done some looking into this, but I would love to capture a digest of jobs that are appropriately run on QPUS and why, in the past. If everybody remembers, we had problems.
There's an X prize for this. So it's not a weird problem. Problems. Just figuring out why anybody would want to run something on.

