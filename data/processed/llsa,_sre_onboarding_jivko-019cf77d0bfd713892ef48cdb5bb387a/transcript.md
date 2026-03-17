# LLSA, SRE Onboarding Jivko - Mar, 16

# Transcript
**Wesley Donaldson | 00:17**
Good morning.

**Jivko Ivanov | 00:21**
Yes, it's good afternoon, but yes, hitting the...

**Wesley Donaldson | 00:24**
Close enough. Right. How did you make it through the storms?

**Jivko Ivanov | 00:28**
Well, right now it seems like subsided, but it seems like there will be more on... They're more on the way... Losing connectivity here and here the alert is until 8 pm something.

**Wesley Donaldson | 00:34**
Yeah.

**Jivko Ivanov | 00:42**
So, yeah, I feel...

**Wesley Donaldson | 00:44**
We had tornado alerts, which is kind of crazy, like, "Crap, since when the tornadoes show up in Georgia?"

**Jivko Ivanov | 00:53**
I mean, I'm from Europe. Where I come from, we don't have tornadoes, so that's a new thing for me as well.

**Wesley Donaldson | 01:00**
You don't yet, but maybe in a couple of years they will.

**Jivko Ivanov | 01:05**
Who knows? That's true.

**Wesley Donaldson | 01:06**
Exactly. All right, so Shipper could make this as fast as we can. So the goal for this session is... I need just another engineer to look through what me how has created for the playbook.
The goal really is just to be able to... With your access to... With your understanding of Thrive, all of us should roughly be in that same base of... I can get to as I understand the application at a high level. The goal is to be able to use the document... How it's created and literally be able to see all the alerts, monitor the alerts, see what's coming in.
So... If you're already doing that... Jiff Cohen, you feel very comfortable with what you're doing as far as the team's notifications. Ignore that like pretend that you only have the base of...
I have an AWS access. I understand the application... I have a good understanding of... As generally... Can the playbook give you what you need to basically monitor the system's health? Does that make sense?

**Jivko Ivanov | 02:09**
Yeah, it does. I just need to know where to look for it in... But yes, I can, sir. Would you guys mind recording as well?

**Wesley Donaldson | 02:11**
Yep.
So I didn't share my screen to share it with you, but like okay, I'll just send you a path real quick but me how feel. Yeah, exactly. Yeah, let's do it. Hold on. Recording. Start recording. Right. All your.

**Michal Kawka | 02:30**
So, the playbook is inside the monitoring assessment document. So in this document, I summarized the gaps that we had, the things that still need to be done... Be done. I already addressed some of them, so I need to update the document once my PR is merged about the dead letter queues.
But the playbook is at the very bottom of the file. It's the appendix, reaction playbook. So the weekly monitoring method methodology is here. So of course, in order to start, you need your AWS access and access to Microsoft things, which you already have.
So the first step, the daily monitoring check, is to basically go to the team's channel and see if there are any alerts. I'm not a big fan of this channel because there's a lot of noise, and in general, it's hard to... It's not hard to lose things on themes.

**Wesley Donaldson | 03:35**
Yeah, very much.

**Michal Kawka | 03:36**
It's the most counterintuitive user interface that I've ever used. So we need to go to see all channels. There's cloud watch notifications. Of course, it's possible to pin that channel, probably. But as you can see, there are all the alerts that we get from... That are, of course, configured to trigger those messages. I don't like this channel. There's too much noise with all the others.
I think we should discuss in the next week or two if we need to adjust any thresholds, if we should find any methodology to basically react. Because for now, as you can see, there are hundreds or thousands of messages already that no one reacts to.
So I think a small part of the process would be that if you verify the alert and you basically check what was wrong, you do your analysis. If it's a false positive or actually a thing that we need to address,
I think we should react with something like a tick or whatever to basically let others know that we took care of the other because currently there's no process. No one is looking into that. Because of that, we had some trouble in the past because no one was monitoring that.
It's hard to monitor that because those alerts don't tell you much. Actually, there is a reason. For example, "No data point received for one period and one missing data point was treated as non-breaching."
So we need to think about it. There are probably a few things that we can do to make it more useful for all of us. So that's the first step to basically check the cloud notifications channel and see if there's anything going on. To be completely honest with you, I would prefer to receive an SMS or some notifications on my phone because this channel is just too much noise, and if I would get a notification on my phone, I think I would react quicker or I would react at all.
But that's a future discussion. I believe that was an off-topic, so to speak. So that's the first step to verify the channel if there are any messages in the channel with the monitoring rotation. The on-call person should perform this strategy at the start of their rotation week and at least once midweek.
So the first thing to do in AWS is to, of course, login. Let's start fresh. I'm sorry, I'm explaining obvious things to you.

**Wesley Donaldson | 06:22**
Notice this is good because explain it no explain it as if it's not jico.
Explain it because, like, this is going to be recording. We're going to share this.
So explain it as much detail as you can with the understanding that this will... People will get this as part of the playbook.

**Michal Kawka | 06:38**
Sure. So the first step is to go to the cloud, watch
the alarms.

**Jivko Ivanov | 07:00**
What you are saying is that we do receive those, but there are a lot, and that's why nobody is acting on them right now. The goal is to decrease the amount and make them more relevant. Am I getting that correctly?

**Michal Kawka | 07:16**
I think so, yes, because if we receive so many alerts daily, either our system is broken or we're monitoring the system in the wrong way, right? Because there were like fifteen alerts or something today. No one complained that the system was not working. There was no increased call center volume.
In the end, it feels like a lot of false positives. So the task for the next week or two would probably be to fine-tune the thresholds, the alarms, and basically get rid of the stuff that is irrelevant or leave the staff that is rather low priority only in AWS.
So notify only on critical things to the channel and believe that the non-critical things up to the daily rotation where the developer goes to AWS and checks things manually because I think critical things should come to us and non-critical things could be resolved later.
But now we received too many alerts. In my opinion, I'm happy to disagree, and there's just a lot of noise.

**Jivko Ivanov | 08:37**
So does that mean make the alerts being relevant, but make them...

**Wesley Donaldson | 08:43**
Sorry, Jeff, go like, let's focus more on just walking the document, please.

**Jivko Ivanov | 08:43**
Yes, okay, sounds good.

**Wesley Donaldson | 08:47**
Like, let's save the editorial. I agree with everything that's being said, but again, I want this to be something where we can just record.
So just focus on walking the document.

**Jivko Ivanov | 08:56**
Okay, I'm looking at the Lambda page in CloudWatch.

**Michal Kawka | 09:01**
Yes. So the first thing in the CloudWatch is to check which alarms are in the state of alarm. So we currently have five. So today the alarm, main prod of parts events triggered, meaning that at least one event was parked within five minutes.
So we have that period of five minutes where we check if an event was parked to the dead letter queue, which is in S3. So in order to give you an overview of what this alert corresponds to, we need to go to S3.
Why is it still slow today? But it's still to last, so it can be slow.

**Jivko Ivanov | 10:04**
From the storm here and...

**Michal Kawka | 10:06**
Just kidding. Maybe. So this alarm corresponds to the connector parked events. So we have two dead letter keys. This dead letter key was created manually to handle the errors that are thrown inside of the code.
Right? So if there's any error thrown in the connectoring the code, that event is parked here and can be replayed with no data loss. On the other hand, there's, of course, that letter is in SQS, but they are automatically configured by AWS, so LLaMA rejects an event for some reason.
If there's any network issue or whatever, the event lands in SQS for this particular Lambda, but for the errors that are thrown inside of the connector. So let's say there was a schema mismatch, the error that we had two weeks ago or three weeks ago where our schema was too strong and the previous events. Basically, the previous projections wouldn't work because the field that was added was non-optional.
So all those events were parked here because the error was thrown within the code. And if the error was thrown by the Lambda, if the Lambda rejected the event, it would land in the SQS. So these are those letter cues for connectors for the errors that are triggered inside of the code. We are currently playing some of them, for example, iterable events.
So as you can see, there's still quite a few because like I said, we are still replaying them. But in the code base there's a script called sorry, wrong, replay part events. So there's a script which lets us replay those events.
So I fine-tuned it a bit to my needs right now. But in general, this version that is currently pushed to main should work for you. So you can specify which bucket you want to replay which LLaMA.
So it automatically downloads the events, replaces them, pushes them to the LLaMA, and if the LLaMA accepts the event with two zeros, the event is then deleted from the bucket. And yeah, the script processes the next event.
If the LLaMA rejects the event for some reason again, then the event is parked here again, and you can try to replay it again or maybe even fix it manually if you think that it makes sense. So these are the dead letter queues for connectors for current connectors which failed because of a programmatic error like schema mismatch or n pointer exception or whatever. They are all parked here and can be replaced without data loss. We have other alarms, but I guess we don't have enough time to explain them all because there are 50 plus alarms.
But the goal is basically to filter by the state in alarm and check if the action is needed or not. I need to do that for today still. So once identified that... Okay, that was a false positive. I'm going to reset the alarm for park events. I'm going to check what happened today, that some events were parked, and then I'm going to reset the alarm. The tricky part with these alarms is that sometimes you cannot really reset them to the normal state in the console.
So unfortunately, I haven't figured out why some of them allow you to do that and why some of them don't. But if you don't see the dropdown in the actions that you can basically reset the alarm, you need to do it using the CLI.
So I'm going to share the comment with you guys on how to reset the alarm because, yeah, it's not possible to do it for those particular events, for those particular alarms in the console. I don't know why yet.
I've figured out maybe it's possible to enable adoption of the console, but for now, I'm resetting them using CLI, which is easy enough because you basically pass the name of the alarm, you use your keys, and there's a command that lets you reset the alarm into the normal state, so to speak.
But like I said, I haven't figured out yet how to do it in the console for the alarms. I built some dashboards. So, for example, the last dashboard that I built is the Pro Current Parked Events, which shows us how many events have been parked.
So as you can see, we do that. No, that's not what you can see, but we basically do it in a five-minute period, so the alarm is triggered. That thing is the sum of the number. Sorry, let me say that again.
So the number that you can see here, which is 38.5, is the sum of the number of the park events in the last five minutes. So you might ask yourself, "Why does the number increase sometimes? Why does the number decrease?" Sometimes that's because it's the span of the last five minutes.
So basically, in the last five minutes, we had more park events than here, for example. That's why the number decreased. So that's the dashboard. As you can see, I built a line for every free bucket that we have here.
So the overview is pretty clear, I believe, but if you think that we should adjust it, let me know. I'm happy to make any improvements to make our lives easier. There are different dashboards like the Supergraph dashboard with various metrics like how many API gateway errors there were and the latency, the request count, and all that stuff.
So the goal of the daily... Maybe not the daily, but the weekly track would be to basically go to all those dashboards and verify visually that everything is fine. The row data is sometimes not descriptive enough, but I think the dashboards and the diagrams are really helpful to debug and visually verify that the system behaves as expected or there are any anomalies.
For some of them, there's no data available because there were no spot sync errors. For example, one the question... Sorry, Wesley, I didn't get identification.

**Wesley Donaldson | 17:22**
Sorry, I think you're all good. One thing that we should add to the dashboard is maybe a quick... Here's what is considered acceptable, here's where you should be concerned. Something like that. Just helps a person who's not familiar with the dashboards to interpret what they're seeing.

**Michal Kawka | 17:41**
Sure, that makes perfect sense. There's... I believe there's a built-in AWS way to do that with some... You basically set a threshold, right? So you would see a red line here saying, "Okay, if we exceed, for example, 20, that's an anomaly or something." I believe I've seen that on some dashboards. I don't know which one that was, but I believe that might have been a rum or something else.
There's definitely a way to set a line which basically tells you, "Okay, you've exceeded the threshold." So it's alarming, and it's possible to configure an alarm for that, of course. I think that what was...

**Jivko Ivanov | 18:22**
More like trying to describe it because if you put it there, I still need understanding. Why is it critical? You put it at 20, but that 20 doesn't mean anything. Why have we decided it's 20?

**Michal Kawka | 18:37**
True. Makes sense. Makes sense.

**Jivko Ivanov | 18:40**
So maybe I'll do...

**Michal Kawka | 18:41**
The documents and I dream like that. Yeah, I believe there can even be an option to update Description directly here because, if you need to jump back and forth between documentation AWS,
it's not very convenient, but I'm almost sure that it's possible to add a Description to the dashboard or to a graph where you can click that, and you'll be able to see what it means. I need to figure it out. The number of locations?
Yeah. So it looks like you have some descriptions here. So if you click on that info icon, it explains what the metric means. So the number of messages returned by cost to the received message action reporting criteria and non-negative values reported if the key is active.
So I think we need to make sure that every graph and every dashboard has that information. So it's easy to interpret by developers doing the weekly rotations. That makes perfect sense. Good point. Going back to the doc... Sorry, wrong up again. That letter queue health check is the next thing.
So we need to go to the...
But it's really slow today. Here we can see all the letter queues that we have configured for the Lambdas. So as you can see, we have quite a few park events for the PDF Lambda, the DLQ, and for the shop if I like as you app hook. I'm not really sure if we should care about the legacy shop if I web hook.
I have no idea whatsoever what it is and what it means. So I asked Jennifer and Harry to look into that last week. But in terms of the results PDF Lambda, LQA, it looks like we have some issues. I'm going to investigate that later today after our meeting and after the meeting with...
But the goal is to basically verify if we have any parked messages in this letter queue and to check what's the reason. So in order to do that, we need to go to that letter queue, I believe or send and receive messages.
Sorry, that's this. So in order to see what's happening, you need to download those messages. So you can, for example, for the first time, poll ten messages. It won't delete them from the queue, but it will enable you to view them.
So I can pull for messages. I pull ten messages now, and I can open them and see what's wrong. That's not the best view ever, right? But I guess the error message is more descriptive. So it says "Failed to launch the browser process error while loading shared libraries cannot open shared object, no such file or directory." It looks to me like some code issue in the LLaMA.
I'll investigate that, and I'll make sure that that's the only error message that we have here. In case there's an issue with that LLaMA, I'm going to fix it today. But that's the next step to basically verify all the letter cues and see what's going on here.
Because as you can see, those things are rather infrastructure/network issues than code issues. So events that are part of SQS are code issues like schemas, null pointer, whatever can happen within the code. There are a lot of things that can go wrong. They get parked here and infrastructure, SLA network changes, they are parked here, and both of them can be replaced so there's no data loss. We are pretty bulletproof in that term.
But of course, those messages need to be analyzed. What I usually do because I don't feel like going through 1700 messages locally, I just download them all to my local directory and then without any cloud code access to the network because currently we are not allowed to do that on prod and on dev, I just download those messages and I analyze them locally.
So Claude won't hit the AWS, but I will have the right tool to analyze those messages manually. So I'll just tell him to go through all the messages and give me a breakdown by the error message so I can see what's the most... What's the most... What's been the highest priority basically, and which error happens the most often?
So that's the next step. I'm happy that we only have parked messages in one queue, so it's going to be an easy task today, but let's go to the next step because I guess I'm talking too much and it's already 25 minutes of our meeting then. Letter. You have checked. Dashboard. Visual review.
So I already showed you how to access the dashboard and what to look for. We discussed that we need to add a description so it's easier for people to understand. A Century review. To be completely honest, I've never used Century on this project. I guess you are working on that. So actually you might be able to show me how to use Century because that was the point that I added because I'm aware of the fact that we have Century, but I've never used that before.
The last step would be to verify if we had any build errors on GitHub recently because I've noticed they are quite often... People don't really react to things like that. That's released. Note so that's on me and admin portal failed after one minute. What was wrong here? Let's quickly see distribution certificates must be in the US East one and I think I've seen that before. I can look into that.
I think we've seen that with Rinor. That's related to certificates. I'll look into that but the most crucial thing for us should be to go to dev and prod environments deployed that and prod and check if there's been any issues in the last days.
If there were, we should attack them as quickly as possible because deployments to dev and prod should be reliable. We shouldn't care too much about PR environments because there's various things that can go wrong, either tests or someone's work is still in progress, but dev and prod should always be clean, should always deploy.
So we need to look into the admin portal issue. One more thing that should be checked because this has some side effects that are sometimes quite severe. We should monitor the destroy PR environment job and make sure that everything's succeeding because otherwise we leave out some orphans in the dev environment and it can lead to the fact that we run out of the... Yeah, EIS or the IP addresses.
So we should monitor that. It's looking quite well after our improvements recently. So there was one issue right here and I bet it was just some AWS corrupted state or something like a rollback or whatever is missing values admin custom domain name. It might have been a human error there. There might have been some value missing, but it's looking well anyway.
So if we have like 1919% success rate, I wouldn't care too much about it. But of course, we need to be consistent with that and check that we don't leave out too many orphans. It's good that Jennifer increased the ENs today because we are implementing new LLaMA.
So I think the limit won't hurt us. But nevertheless, we should really monitor that. We don't leave out any orphans in the environment because it's just resources that we pay for and no one is using them because they stay in the desktop forever.
From my perspective, these are the most crucial things to monitor in terms of the alerting dashboards, parked messages, and our pipelines. But of course, I'm happy to incorporate into the document any things you think are important.

**Wesley Donaldson | 28:35**
Okay, I'm going to stop the recording. I think we may just need to do this one more time, but let me stop it and ask questions.

**Michal Kawka | 28:45**
First thing. Yeah, let's make the recording clean next time so I can prepare a script. So that is neat because this time it was improvised.
So let's prepare a proper recording for everyone so we are not ashamed to share it with everyone.

**Wesley Donaldson | 29:04**
I would say you go maybe take a pass, look through, get a perspective, and share back with me what you think is missing. Great feedback that you had regarding, "Hey, what is the definition of good here?"
So get that feedback to him. Let's update the doc and then we'll do another session. I'm going to try walking through it myself today just to... I've reviewed it for content. I've opened a few of them, but I haven't walked the full doc, so I'll try that as well to give you more feedback.
But that being said, we have a one o'clock. We've got to jump to it. So let's call it here.

**Jivko Ivanov | 29:35**
Yeah, I'm just trying to understand what exactly is requested from me. But here I will do the work of the document. Okay. Sounds good. Let's jump to the other one.

**Wesley Donaldson | 29:43**
I guess. Like.

**Michal Kawka | 29:45**
Thank you. Thank you.

