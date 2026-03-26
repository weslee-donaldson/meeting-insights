# (Hold) LLSA , Internal Engineering Sync - Mar, 26

# Transcript
**Wesley Donaldson | 00:23**
Jeffco, can't make it.

**Michal Kawka | 01:30**
No, it was good.

**Wesley Donaldson | 01:31**
How'd you like that meeting?

**Michal Kawka | 01:35**
I mean, I think we needed that meeting to get on the same page with Jennifer. Because, you know, alerting was mostly between me and you on just between the two of us. And I think we needed her to prioritize to, you know, to get the direction and get on the same page.
I think it was necessary. And, yeah, we know what to do now.

**Wesley Donaldson | 01:58**
Yeah, I'm going to fill out a specific epic for that. I think we just need to close the loop on the playbook just to get it off our plate.

**Sam Hatoum | 02:07**
I don't know, but I wasn't going to make it up, but I'm going to make...

**Wesley Donaldson | 02:13**
Sorry, I go ahead.

**Sam Hatoum | 02:14**
So I think I thought I wasn't going to make it, but then I ended up making it. So let's just see how things are going and how we're looking for the end of the week. Are we tracking?

**Wesley Donaldson | 02:19**
You're right on time.

**Sam Hatoum | 02:24**
Is there something we can help with?

**Antônio Falcão Jr | 02:25**
With...

**Wesley Donaldson | 02:31**
So I'll go really quickly. I'm a little concerned. Honestly, things are all coming together. Antonio, can you share? I think your stream is super important because it has downs, it's impacting the verification of a couple of the streams.
So maybe if you can share how you're doing, if you're progressing, if you... I think we need to leave a little bit of space for us to make sure everything is connected properly and address any bugs for that.
So I think we need to target the worst-case scenario at the end of the day today to have all of ours, all your pieces buttoned up, and that way we can support the proving everything goes through the system.

**Antônio Falcão Jr | 03:11**
You guys? Good morning. On my side, all is going pretty well. So, I have the code ready for a review, and I'm doing more interesting testing on it. So, I hope it will be all set by the end of today.
In addition to the change to the end into testing suites to validate this fully...

**Sam Hatoum | 03:37**
Yeah. So, when you say "ready," Antonio, can you just give me a quick overview of what surface area that is because I know we've spoken about a lot of things? I just want to be sure I'm tracking absolutely.

**Antônio Falcão Jr | 03:49**
Is the recurring ACL refractory to be using EMET as a framework and post-degrees sorry, and both degrees as event store and projector?

**Sam Hatoum | 04:08**
Okay, and what is it doing? Just all recurring events?

**Antônio Falcão Jr | 04:14**
Come over again.

**Sam Hatoum | 04:14**
Sorry, is it all recurring events?

**Antônio Falcão Jr | 04:20**
It's recurring specifically. Yeah, recurring specifically. We have two streams, order streams and membership streams, right? And those two streams are in PostgreSQL Event store and PostgreSQL Event store. Yeah, using Aurora both... Yeah, both it store and projections are on our other posts now.

**Sam Hatoum | 04:42**
What about the stuff that Lance was doing? Is he going to be able to wire that up though in time? Have you managed to speak to him at all?

**Antônio Falcão Jr | 04:55**
Yes, but he doesn't have to wire now. Yeah, actually, if I'm mistaken, it's the opposite, right? The reactor will produce events so he can consume.

**Sam Hatoum | 05:09**
That's what I'm saying. So that's what I'm

**Antônio Falcão Jr | 05:12**
So that's what I'm saying. Yeah, the we have two reactors on the mt side. One will we'll push the order placed, then the other one will push the membership renewed and those two messages will be consumed on.

**Sam Hatoum | 05:29**
Yeah, it's making sure that he's ready for that. Because is that going to guarantee what's going to put it in? I guess the guarantee wants delivery. You could probably use there too, to make sure that it actually goes into the SQS at all, right?
That's what we're saying.

**Antônio Falcão Jr | 05:43**
Right? Correct, yes.

**Sam Hatoum | 05:45**
Okay, so just is that going to be like a...? I'm just trying to figure out how we're going to stage this. Let's just talk real quick about the exactly once delivery because I haven't done it. What does that involve? Is it just a configuration or is it trivial? Is it hard?
Emmett, what do you have to do?

**Antônio Falcão Jr | 06:04**
On the Emmett side? We do have the workflow carrying on these as exactly one deliver for us. Got it.

**Sam Hatoum | 06:12**
Okay, and when that runs, does it work, put some state in post-grads, and now it's delivered? Great. Are you then going to make the call into the thing that Lance is building, which is the SQS? Yeah.

**Wesley Donaldson | 06:30**
Curious.

**Antônio Falcão Jr | 06:33**
The reactor will make the work. Yeah, the idea around those two reactors is that they will become completely autonomous and independent. Independent with the workflow. They are how can I say they work by consuming the outbound stream.
So if we need to retry and avoid duplications, this workflow mechanism will care about that for us. So if SQS is down somehow or the connection fails, we will not lose or duplicate disintegration. So... Not sure if I answered your question.

**Sam Hatoum | 07:17**
No, that. That is answering my question so hundred percent. I'm just wondering, like, o now that you've got this far, I assume, like, what is your boundary? And now are you taking care of the coal that happens from the reactors into SQS.
So and yeah now it says yeah, AZ that's now you right.

**Antônio Falcão Jr | 07:37**
It is me. I'm doing the full Emmett side work like the projectors, the reactors, and the AC hydration work. Yeah, it's all one fantastic.

**Sam Hatoum | 07:47**
So just have that conversation with Lance to let him know to be ready. In the meantime, I would say give him the payload that you are going to be sending so he can start testing with that payload like a greedy interface effectively.
That way, you can slop together at the end and integrate.

**Antônio Falcão Jr | 08:04**
Yeah, perfect. I would do that. Yeah, I have a SQS placeholder now just waiting for him to set up the infrastructure. I'm assuming he's done with that part already at this point, and I was about to share with him those two domain events.

**Wesley Donaldson | 08:15**
Yes.

**Antônio Falcão Jr | 08:22**
Shape actually, we shared the order placed one already. I have to share the other one, the membership renewed one so he can mock and start working with.

**Wesley Donaldson | 08:33**
Yeah, just the same thing you did over here. Just add that to the confluence page point I at.

**Sam Hatoum | 08:39**
So as you said, you're concerned, were we concerned? Does it sound like everything's in hand with Antonio at least within the ET circle within the emit bunch?

**Wesley Donaldson | 08:46**
No. So that's ideal. So we're tracking good there. Great, we'll have the payloads over. I think the other path that I'm concerned about is on the order side.
So Antonio, you're going to connect with Sam if you had a chance to do that yet.

**Sam Hatoum | 09:00**
What is that?

**Wesley Donaldson | 09:02**
The projections not yet.

**Antônio Falcão Jr | 09:03**
Not yet. Yeah.

**Wesley Donaldson | 09:05**
Okay, that's fine. When you guys connect, this is still an outstanding question as well. I... This assumes this SQL interface is going away because we're moving away from current for recursively.
So this seems obvious. And the next one is just confirming that this line now goes back to what it always was, which is just connecting directly to the Postgres inside of Aurora.

**Sam Hatoum | 09:27**
No. They should be able to do... They're not going to be as nice, but because it's in Postgres and it's just SQL, they should be able to do SQL and then do deep inspection into the JSON events and then still get the data they want.
Because technically... Correct me if I'm wrong, Antonio. But I think we should just be able to do JSON queries and still get BI access Postgres and get whatever data they want.

**Antônio Falcão Jr | 09:54**
We do. But in order to simplify, I was... I took the path by using regular relational tables for projection. So either BI or supergraph can consume independently.

**Sam Hatoum | 10:14**
I'm saying most far, we can still have BI. Everything that we've done so far for BI we can still have but for if BI wants something extra, that was the whole point. The same with current because current added the secondary DBS, but Postgres because it's Postgres, it has it implicitly in there.

**Wesley Donaldson | 10:33**
Exactly.

**Sam Hatoum | 10:33**
As long as we just tell them, "Hey, here's the data schema. Here's the events. You can look at them." It's volatile because these are storage events, and we might change things, but at least they can be lagging behind a little bit.

**Antônio Falcão Jr | 10:46**
I see what you mean. Okay, they can clear the stream. They stream... I see what you mean.

**Sam Hatoum | 10:56**
Yeah, exactly. So I think all I'm saying is we don't get rid of the box, we can keep that exactly as it is. Yes. It goes away from current but we still have the facility to do that with Postgres.

**Wesley Donaldson | 11:07**
Yeah.

**Sam Hatoum | 11:07**
Just in an unorthodox way basically.

**Wesley Donaldson | 11:12**
So basically... Here now just to... If you're seeing the screen share, disconnection now goes to here by virtue of they can do whatever queries they need to against the underlying data.

**Sam Hatoum | 11:13**
Okay.
One.
Yeah, yes, correct.

**Wesley Donaldson | 11:30**
Okay, so then let's just delete... Just to keep you clean. And then this is here. Okay. Perfect. Thank you.

**Antônio Falcão Jr | 11:44**
It's looking good, and thank you.

**Sam Hatoum | 11:46**
For all this. Are you concerned about anything? Nothing specifically.

**Antônio Falcão Jr | 11:55**
I'm good. Yeah, I was just about to ask Wesley to share with me the conference page link again, because I'm not finding that I need...
Please, I need to put the membership renewed event on this one as well.
Yeah, thank you.

**Wesley Donaldson | 12:14**
No worries. It's here.

**Antônio Falcão Jr | 12:20**
Ref... Guys, I'm okay, I have no concerns, I'm very up positive about this.

**Sam Hatoum | 12:33**
I mean to help. How about you, ma'am? Anything that you need to report or need help with?

**Michal Kawka | 12:40**
Not really. So I wrapped up the record Taug integration, I'm going to test it on that right now. You always already started reviewing the code, so I'm good. There's one thing unrelated to the e-commerce, which is removal of the event store DB streams.
So I was working on a job to delete the streams that we create for PR environments, but unfortunately, it's not as easy as I thought because event sourcing and event story B are built on this concept in mind where events are immutable.

**Wesley Donaldson | 13:04**
What?

**Michal Kawka | 13:14**
So it's not as easy to delete those events as I thought because we are running out of disk storage on... When we abuse the environment with PR environments. But I think we can defer that, and I'll simply do some research over the weekend with AI, Claude.
Whatever we have... But it's not related to the e-commerce per se. So I think it can wait until Monday. I'll just invest some time on the weekend because there's constantly something on my plate, and I thought it would be easier than it actually is because...

**Sam Hatoum | 13:47**
Yeah, I'm glad you discovered that. But what you can do look into this is you can actually put a tombstone on a. On a stream. You can basically say this stream is ended, and then you can scavenge. Yeah, that's the way you quote unquote delete. You can you basically like once these DOS streams ended, it basically keeps it there, but you can then say I want a Scaveng and now you can get some data back.
So look into that, into the documentation. Yeah.

**Michal Kawka | 14:22**
I need to do some research because there's an option to delete a stream. The stream doesn't appear in the system anymore, but the events are still preserved.

**Sam Hatoum | 14:32**
Right? Exactly. Because all it's doing is putting a tombstone on that. Really? On that final event. The... Says when you try and write to it again, it says no, you can't write to it. This is the dead stream, but you can still access all the data because it's a medium without...
You know it happened unless you specifically want to market for scavenging and so on, but look at the process around that. There is a way to delete.

**Michal Kawka | 14:53**
Sure, I will. Thank you so much, Sam, that helps.

**Sam Hatoum | 14:55**
Mer cool.

**Wesley Donaldson | 14:57**
Thanks. Guys?

**Sam Hatoum | 15:00**
Leave you to it then. Anyone needs anything, reach out.

**Wesley Donaldson | 15:01**
Y guys.

**Sam Hatoum | 15:02**
Thank you so much for your work.

**Michal Kawka | 15:05**
You talk to you later.

**Antônio Falcão Jr | 15:07**
Bye, guys. Have a good one.

