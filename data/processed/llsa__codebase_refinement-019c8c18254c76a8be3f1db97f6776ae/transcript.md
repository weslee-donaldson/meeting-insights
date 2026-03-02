# LLSA: Codebase Refinement - Feb, 23

# Transcript
**Wesley Donaldson | 00:01**
I will accept this. 
I'm not sure if Sam can make this. Me. Busy. Excuse me?

**Sam Hatoum | 00:57**
Me doing? And do you have? Antonio?

**Wesley Donaldson | 01:01**
He accepted this, so let me just pick in real quick.

**Sam Hatoum | 01:04**
Alright.

**Wesley Donaldson | 01:10**
We just came off a meeting, so he should be up there for goes. Antonio. 
Tony, you can hear us, you guys, all right, so you guys probably know more about this session.

**Sam Hatoum | 01:26**
Okay, I cannot. Hey guys.

**Wesley Donaldson | 01:34**
I do. Antonio from our sync this morning. Just want to talk through some of the issues that Harry had raised with the overall build. 
That's enough setup.

**Sam Hatoum | 01:47**
Okay, let me get my notes real quick, just a se sorry, just one moment.

**Wesley Donaldson | 01:54**
Sorry for mo guys.

**Antônio Falcão Jr | 01:55**
Guys.

**Wesley Donaldson | 01:55**
Ye Tony, if you want to just pull up the list that you had shared over Slack and just maybe give a little bit more context when Sam comes back on.

**Antônio Falcão Jr | 02:07**
Yeah, I'm doing that right now.

**Wesley Donaldson | 02:09**
Sorry, I don't have much more context other than what was shared over the Slack channel's.

**Antônio Falcão Jr | 02:20**
Okay, good, let's go.

**Wesley Donaldson | 02:21**
So hold on, s at a step away.

**Antônio Falcão Jr | 02:21**
So, basically, sorry. 
So what good skiing recommendations do you have for us Colorado?

**Wesley Donaldson | 02:58**
So what good skeing recommendation do you have for us? [Laughter] Go when there's snow a good one.

**Antônio Falcão Jr | 03:07**
[Laughter].

**Sam Hatoum | 03:10**
A good one. [Laughter] All right.

**Wesley Donaldson | 03:12**
All right, sorry about that.

**Sam Hatoum | 03:13**
Sorry about that, sir.

**Wesley Donaldson | 03:14**
So just.

**Sam Hatoum | 03:14**
Just. I know we're short on time the today.

**Wesley Donaldson | 03:14**
I worked short on time today, so let's just get doing this as quick as we can.

**Sam Hatoum | 03:16**
So let's just get through this as quick as we can. So I spoke with Stace, and, I'm just gonna get tick guys for a walk, by the way, because my feet, my legs are just going to jelly these days, so.

**Wesley Donaldson | 03:19**
So I spoke with Stace, and, I was gonna get tick bas for a walk, by the way, because my feet, my legs are just going to jelly these days. So that's what you're seeing.

**Sam Hatoum | 03:29**
Yeah, that's what you're seeing. I'm trying to.

**Wesley Donaldson | 03:37**
So.

**Sam Hatoum | 03:37**
So yeah, I spoke to stay first to Harry and Dane and then Stace, and there was an issue of like, why did adding, you know, this new event type or whatever it is that they added, why did that break the world?

**Wesley Donaldson | 03:37**
So yeah, suppose this spoke to Harry and Dane and then stays. 
And there was an issue of like, why is adding, you know, this new event type or whatever it is that they added. But why did that break the world?

**Sam Hatoum | 03:52**
You know, first we saw the front end break and then we saw the back end break and the connectors broke and Stas like, the fact is this a house of cards.

**Wesley Donaldson | 03:52**
You know, first we saw the front end break. And then we saw the back end break in. The connector is broken sta' like the fact this is a house of cards.

**Sam Hatoum | 04:02**
So rightfully, he's saying this is what I'm going to see when it comes to my overall system going forward.

**Wesley Donaldson | 04:02**
So rightfully he's saying this is what I'm going to see when it comes to my overall system going forward.

**Sam Hatoum | 04:11**
I really don't want to be using this for a curly and what have you, right?

**Wesley Donaldson | 04:11**
I really don't want to be using this for the Curly and what have you. Right?

**Sam Hatoum | 04:15**
So you can see his concerned, to which I walked him off the legend.

**Wesley Donaldson | 04:15**
You can see his concern to which I walked into the Legion.

**Sam Hatoum | 04:20**
Like I said, well, first I said everyd like, I'm gonna go figure out for you what's going on.

**Wesley Donaldson | 04:21**
I guess the what? 
First I said, Dick, I'm gonna go and figure out for you what's going on. And I did.

**Sam Hatoum | 04:25**
And I did. I went and dug in and to see what the problem is and have identified where all the issues are and how we should be solving them.

**Wesley Donaldson | 04:25**
I went and dug in to see what the problem is and identified where all the issues are and how we should be solving them.

**Sam Hatoum | 04:34**
And that's what I'm going to talk to you guys about right now.

**Wesley Donaldson | 04:34**
And that's what I'm going to about right now.

**Sam Hatoum | 04:36**
So. You.

**Wesley Donaldson | 04:36**
So. You both.

**Sam Hatoum | 04:37**
Both of us. Speak. And then we're going to talk about how we're going to schedule that.

**Wesley Donaldson | 04:38**
And then we're going to talk about how we're going to schedule that.

**Sam Hatoum | 04:41**
Working to make sure that, you know, we get to come in the right time before we get started because we're going to get momentum as we get in, as we get on with, Curley and I.

**Wesley Donaldson | 04:41**
Working to make sure that you know, we can get the department the right time before we get started because we're going to get momentum as you get in, as you get on with RECY. 
And you've got to be sure that you know we're not going to break it, right?

**Sam Hatoum | 04:55**
And we've got to be sure that, you know, we're not gonna break the world. All right? So that's the context.

**Wesley Donaldson | 04:59**
So that's the content that makes sense in any questions tracking so far.

**Sam Hatoum | 05:00**
Does that all make sense in any questions? All right, so, Antonio, have you spoken to the guys?

**Wesley Donaldson | 05:08**
So I'm. Have you spoken to the guys, do you?

**Sam Hatoum | 05:10**
Do you?

**Wesley Donaldson | 05:11**
When I sailed.

**Sam Hatoum | 05:11**
When I say all this, is it resonating?

**Wesley Donaldson | 05:12**
This is it resonating.

**Sam Hatoum | 05:13**
Do you know what I'm talking about?

**Wesley Donaldson | 05:13**
Do you know what I'm talking about?

**Sam Hatoum | 05:14**
Do you know where the errors are already, or should II mean, I'm going to go over them anyway, but do you know what I'm talking about?

**Wesley Donaldson | 05:14**
Do you know where the errors are already? I like I don' part of it, yeah, good part of it.

**Sam Hatoum | 05:20**
First and foremost.

**Antônio Falcão Jr | 05:22**
Part of it. Yeah, a good part of it. I took a look on the code and I did my own analysis to understand.

**Wesley Donaldson | 05:24**
I took a look at the code and I gave my own analysis to understand as pain.

**Antônio Falcão Jr | 05:28**
HARRIS PAINT yeah.

**Wesley Donaldson | 05:29**
Yeah, okay, cool.

**Sam Hatoum | 05:30**
Okay, cool, good. So few things like the first thing is why is it happening?

**Wesley Donaldson | 05:31**
So few things like the first thing is why is it happening?

**Sam Hatoum | 05:40**
So Chris Goldman, none of you have met.

**Wesley Donaldson | 05:40**
So Chris Aman was a met maybe that but Chris Goldman was previously on this project and I finally you actually replaced him on a project.

**Sam Hatoum | 05:43**
Maybe you've met, I don't know, but Chris Goldman was previously on this project, and I'm Tanya, you actually replaced him on the project, so probably didn't meet.

**Wesley Donaldson | 05:49**
So we didn't.

**Sam Hatoum | 05:51**
Okay. But anyway.

**Wesley Donaldson | 05:52**
But anyway, Chris didn't understand it.

**Sam Hatoum | 05:53**
Chris didn't understand event sourcing and he.

**Wesley Donaldson | 05:55**
And sourcing and he.

**Sam Hatoum | 05:57**
My mistake putting people that don't understand event sourcing on a project, so I'm to blame.

**Wesley Donaldson | 05:57**
My mistake of people that don't understand it that sourcing on another project. So I'm at length.

**Sam Hatoum | 06:03**
But he did some things like when a projection runs, if there's an event, it doesn't recognize it.

**Wesley Donaldson | 06:03**
But he did some things like when a projection runs, if there's an event it doesn't recognize there's an exception, which much easier, right?

**Sam Hatoum | 06:13**
It was an exception, which is a right.

**Wesley Donaldson | 06:16**
You never throw an exception.

**Sam Hatoum | 06:16**
You never throw an exception. When you don't recognize an event, you simply drop it on the floor.

**Wesley Donaldson | 06:17**
When you don't recognize that event. He simply drop it on the floor. Alr.

**Antônio Falcão Jr | 06:23**
Right?

**Wesley Donaldson | 06:24**
Just my consent heer.

**Sam Hatoum | 06:41**
Guys can you hear me.

**Wesley Donaldson | 06:42**
Me now we can now you're a bank.

**Antônio Falcão Jr | 06:44**
Now you're back.

**Sam Hatoum | 06:45**
Okay, so yeah so I had to disconnect the WIP I should be good now can you hear me?

**Wesley Donaldson | 06:45**
Okay, so yeah so I have to disconnect one I should be good enough can you hear me?

**Sam Hatoum | 06:49**
Okay, yes, we can.

**Wesley Donaldson | 06:49**
Okay, yes we can.

**Sam Hatoum | 06:51**
Okay, yeah, so part one is you never, ever drop in a projection.

**Wesley Donaldson | 06:51**
Okay, yeah, so part one is you never, ever drop in a projection, never.

**Sam Hatoum | 06:56**
You never you read the events you're interested in, and if you're not interested in, you drop it on the floor.

**Wesley Donaldson | 06:57**
You read the events you're interested in, and if you're not interested in, you drop it on the floor.

**Sam Hatoum | 07:01**
You never throw an exception, correct? 
That's problem number one.

**Wesley Donaldson | 07:05**
Number one. 
So there are still some projections in there that do that.

**Sam Hatoum | 07:06**
So there are still some projections in there that do that. And then and when we looked at one of the projections actually turned out it was doing it, but that was dead code.

**Wesley Donaldson | 07:11**
And when we looked at one of the projections actually found out it was doing it, but that was dead color.

**Sam Hatoum | 07:15**
That projection was not being used anywhere.

**Wesley Donaldson | 07:15**
That projection was not being used anywhere.

**Sam Hatoum | 07:17**
So.

**Wesley Donaldson | 07:17**
So. I'm telling you.

**Sam Hatoum | 07:17**
Antonio.

**Wesley Donaldson | 07:18**
Please.

**Sam Hatoum | 07:18**
Please take note of everything I'm saying, because we're going to have to, like, clean up the code around the things I'm talking about.

**Wesley Donaldson | 07:18**
Take note of everything I'm send in because we're going to have to, like, clean up the code around the things I'm talking about.

**Sam Hatoum | 07:22**
That's the task.

**Wesley Donaldson | 07:22**
That's the task.

**Antônio Falcão Jr | 07:24**
Okay?

**Wesley Donaldson | 07:24**
Okay, I'm doing that.

**Antônio Falcão Jr | 07:24**
I'm doing that, okay?

**Wesley Donaldson | 07:26**
Just ask me any questions if something doesn't make sense.

**Sam Hatoum | 07:26**
Just ask me any questions if something doesn't make sense.

**Wesley Donaldson | 07:30**
Just note that there is definitely you look at anything that those exceptions and then look if that projection is being used at all.

**Sam Hatoum | 07:30**
Just note that there is definitely, you know, look for anything that throws exceptions and then look if that projections being used at all, because if it's not just kill it's dead code.

**Wesley Donaldson | 07:38**
Because if it's not just kid, it's their code makes sense.

**Antônio Falcão Jr | 07:41**
Makes sense. Okay.

**Wesley Donaldson | 07:42**
Okay, well that should be easy too.

**Sam Hatoum | 07:43**
Alright, one that should be easy too. The other problem is that we you don't fall into the pit of success.

**Wesley Donaldson | 07:46**
The other problem is that we. You. You don't fall into the pit of success.

**Sam Hatoum | 07:53**
You fall.

**Wesley Donaldson | 07:53**
You.

**Sam Hatoum | 07:53**
You fall into a pit of spikes.

**Wesley Donaldson | 07:53**
You fall into a pit of spikes with the way's been risen.

**Sam Hatoum | 07:55**
With the way it's been written and that.

**Wesley Donaldson | 07:57**
And that's about this S library, which is like Zoho schema that's basically creates some order around the events because otherwise you end up with loose types.

**Sam Hatoum | 07:58**
That's about this S library, which is like ZOB schema S basically creates some order around the events because otherwise you just end up with loose types. 
So they opted to use this S library.

**Wesley Donaldson | 08:10**
So they opted to use this S library.

**Sam Hatoum | 08:14**
And the problem is the S library by default, whenever you create a type in there like a scheme in a schema, I believe by default everything's required unless you explicitly say optional.

**Wesley Donaldson | 08:14**
And the problem is the S library. By default, whenever you create a type in like a scheme in a schema, I believe by default everything is required unless you explicitly say optional and this is a slippery slope.

**Sam Hatoum | 08:29**
And this is a slippery slope for adding fields to an event in an event source system, because the last thing you want to do is say that it's required.

**Wesley Donaldson | 08:30**
Or adding fields to an event in an event source system. 
Because the last thing you want to do is say that it's required.

**Sam Hatoum | 08:39**
The default should be that it's not required.

**Wesley Donaldson | 08:39**
The default should be that it's not required, actually.

**Antônio Falcão Jr | 08:42**
Actually.

**Wesley Donaldson | 08:45**
Okay, that makes sense.

**Antônio Falcão Jr | 08:45**
Okay.

**Sam Hatoum | 08:46**
That makes sense.

**Wesley Donaldson | 08:47**
Yes.

**Antônio Falcão Jr | 08:48**
It does this.

**Wesley Donaldson | 08:49**
Yeah, you only process what you care about. What's your way.

**Sam Hatoum | 08:53**
Yeah, so, you know, it's the library's not helping us.

**Wesley Donaldson | 08:55**
So, you know, it's the library's not helping us, so either we can go and look at that library and see if we can configure it by default option.

**Sam Hatoum | 08:58**
So either you can go look at that library and see if we can configure it that by default optional, everything is optional.

**Wesley Donaldson | 09:04**
Everything's optional, but then that kind of defeats the purpose.

**Sam Hatoum | 09:06**
But then that kind of defeats the purpose. A little bit of a library.

**Wesley Donaldson | 09:07**
A little bit of a library.

**Sam Hatoum | 09:08**
I don't know.

**Wesley Donaldson | 09:08**
I don't know.

**Sam Hatoum | 09:09**
All right, and I think that would be better if everything was loose.

**Wesley Donaldson | 09:12**
I mean, I think that'd be better if everything was loose.

**Sam Hatoum | 09:14**
But then you just say.

**Wesley Donaldson | 09:14**
But then you just say on my e.

**Sam Hatoum | 09:15**
On ID. It's not required.

**Wesley Donaldson | 09:16**
Stop the fire.

**Sam Hatoum | 09:16**
For example.

**Wesley Donaldson | 09:16**
For example, then that's okay.

**Sam Hatoum | 09:17**
Then that's okay, right? So that's the second thing to look at.

**Wesley Donaldson | 09:19**
So that's the second thing to look at.

**Sam Hatoum | 09:21**
But it's only a temporary solution, because when we use Emmett, which is a type based one TYPESCRIPT based, then it should be a lot cleaner, right?

**Wesley Donaldson | 09:21**
But it's only a temporary solution because when we use NT, which is a type based one has based it should be a lot cleaner. 
Well, because when you use med, you no long need solt all as solar anything, right?

**Sam Hatoum | 09:35**
Because when you use Emmett, you no longer need Zoho door as well. Anything, right? Okay, but so we are going to move towards Emmett, but temporarily.

**Wesley Donaldson | 09:45**
Okay, but so we are going to move towards n but temporarily.

**Sam Hatoum | 09:50**
I think it's worth just looking at this ZD SS library.

**Wesley Donaldson | 09:50**
I think it's worth just looking at this SS library.

**Sam Hatoum | 09:53**
I think people's fingers have been bitten enough now to like, know that that's a problem and they should look out for it, but still we gotta.

**Wesley Donaldson | 09:53**
I think people's fingers have been bit enough now to like, know that that's a problem and they should look out for it, but still we gotta it'd be good to have that solution.

**Sam Hatoum | 10:05**
It'd be good to have that solution in there. Alright, so f so good.

**Wesley Donaldson | 10:08**
Alright, so good.

**Antônio Falcão Jr | 10:14**
So far, so good.

**Wesley Donaldson | 10:14**
So possible good.

**Sam Hatoum | 10:15**
Yeah, okay.

**Wesley Donaldson | 10:15**
Yeah, sorry, I can't see your faces, so I just have to, like, hear your voices.

**Sam Hatoum | 10:18**
Sorry, I can't see your faces, so I just have to, like, hear your voices with confirmations.

**Wesley Donaldson | 10:21**
Confirmations.

**Sam Hatoum | 10:24**
Step number three is the third thing I found was.

**Wesley Donaldson | 10:24**
Step number three. The third thing I found was when the projection, when the connectors are working the back end and they need.

**Sam Hatoum | 10:29**
When the projection. When the connectors are working in the back end. 
And they need some design decision that was taken at the time was to use in line projections.

**Wesley Donaldson | 10:37**
The design decision that was taken at the time was to use in line projections.

**Sam Hatoum | 10:45**
And so everything happened in line.

**Wesley Donaldson | 10:45**
And so everything happened in line.

**Sam Hatoum | 10:47**
Like every time you needed something, you project the data up to that point in time and you make a decision, right?

**Wesley Donaldson | 10:47**
Like every time you need something, you project the data at that point in time and you make a decision, right?

**Sam Hatoum | 10:53**
So they're not persisted anywhere, they're not stored as a cache anywhere.

**Wesley Donaldson | 10:53**
So they're not persisted anywhere and not stored as a cache anywhere, which means the connector's side all the data is being fetched live from the event tool every time you want.

**Sam Hatoum | 10:57**
Which means on the connectors side, all the data is being fetched live from the event tool every time you want them. Yeah, but now since then we've actually put re models in for BI.

**Wesley Donaldson | 11:08**
But now since then, we've actually put remodels in OBR and so remodels can be updated instantaneously when a new event comes in, we can project into a remodel.

**Sam Hatoum | 11:13**
And so Reed models can be updated near instantaneously when a new event comes in. We can project into a RE model. And now we have state and a Reed model.

**Wesley Donaldson | 11:21**
And that we have. Stay and read more. And so what we should be doing is writing a repository layer on top of our reat models that data from our eventually consistent read models rather than from these projections all the time.

**Sam Hatoum | 11:25**
And so what we should be doing is writing a repository layer on top of our Reed models that fetches data from our eventually consistent read models rather than from, you know, projections. All the time. 
And so, you know, when the projection failed because of a SOD problem an S problem, it ended up failing in the connectors because all the connectors depend on them too.

**Wesley Donaldson | 11:40**
And so, you know, when the projection failed because of a solved problem and s problem, it ended up failing in the connectors because all the connectors depend on them too.

**Sam Hatoum | 11:52**
Got it? So the solution there is whenever we want to read data, you know, decide a pattern, right?

**Wesley Donaldson | 11:55**
So the solution there is whenever we want to read data, you know, decide a pattern, right?

**Sam Hatoum | 12:01**
Like we evolve anyway, like, again, a lot of this stuff can be solved with Emmett, right?

**Wesley Donaldson | 12:01**
Like we evolve anyway. Like again, a lot of this stuff can be solved with right, because M it has an internal state machine built in, so it builds up internal state quickly, and it has persistent subscriptions and so persistent projections you can persist them in postscripts.

**Sam Hatoum | 12:06**
Because Emmett has an internal state machine built in, so it builds up internal state quickly, and it has persistent subscriptions and so persistent, projections, you can persist them in post Squars. 
So I think if we leverage the features of Emmett here again, we can win.

**Wesley Donaldson | 12:20**
So I think if we leverage the features of EME here again, we can.

**Sam Hatoum | 12:24**
But I just wanted to highlight where one of the other like brittleness is that somebody changes a breaks a projection, it ends up breaking all connectors that use that projection.

**Wesley Donaldson | 12:24**
But I wanted to highlight where one of the other brittleness is that somebody changes a break a projection, it ends up breaking all connectors that use that projection. 
Not to let my ignorance.

**Sam Hatoum | 12:41**
So far so good.

**Wesley Donaldson | 12:43**
Well, if we. If you have a bit. Just help me conceptually understand that a projection is based off the event store. So a projection is kind of like a read only representation of the data in the event store. How does a projection break a connector when a connector is going to the current DB to get data to create the projection? Am I misunderstanding?

**Sam Hatoum | 13:04**
The projection is the function, and the code in the function is what broke.

**Wesley Donaldson | 13:04**
The projection is the function and the code and the function is what broke because the projection is now being reused in so many different places.

**Sam Hatoum | 13:08**
And so because the projection is now being reused in so many different places. You break it, you break the code for it.

**Wesley Donaldson | 13:13**
You break it, you break thede for it once it breaks everything but the lies in us gota at a code level even though it should be at a data lo I'm trying to if it yeah so like so then a solution here.

**Sam Hatoum | 13:15**
Once it breaks everything that relies on it at a code level, even though it should be at a data level, right? 
Like if it yeah, so like so then the solution here. So I'll just finish off point number three.

**Wesley Donaldson | 13:31**
So I'll just get I'll finish off point number three that the third point is that you know the reason connectors were breaking everywhere.

**Sam Hatoum | 13:34**
So that's the third point is that you know, the reason connectors were breaking everywhere. I had to highlight that to Stace.

**Wesley Donaldson | 13:38**
I to highlight that to Stace.

**Sam Hatoum | 13:40**
It's not because we built a house of cards, it's simply because the projections were being used in that directly.

**Wesley Donaldson | 13:40**
It's not because we're dot house of cards. 
It's simply because the projections are being used indeirectly.

**Sam Hatoum | 13:48**
So I'm telling you, I'm counting on you to make sure you know, just give me verbal cues and confirmations if you.

**Wesley Donaldson | 13:48**
So I'm telling you, I'm counting on you to make sure if you just give me. Give me verbal cues and confirmations if you.

**Sam Hatoum | 13:54**
Or if you have any questions acknowledge yeah there you go, that's it, that's you just brought me back to my command and conquer acknowledged you ever played that it's like point of somewhere.

**Wesley Donaldson | 13:54**
Or if you have any questions, co you go you just brought me back to my command and com I love to play the nod acknowledge you [Laughter] cool.

**Sam Hatoum | 14:11**
Acknowledged, affirmative. 
Yeah, cool. Alright, and I think the fourth one was the fourth problem I found out.

**Wesley Donaldson | 14:18**
I think the fourth one is the fourth problem.

**Sam Hatoum | 14:25**
Yeah.

**Wesley Donaldson | 14:25**
Yeah.

**Sam Hatoum | 14:25**
It's this whole, like, object oriented versus functional approach.

**Wesley Donaldson | 14:25**
It's this whole, like, object oriented versus functional approach.

**Sam Hatoum | 14:31**
And, you know, like when we first start.

**Wesley Donaldson | 14:31**
And you, like when we first start.

**Sam Hatoum | 14:34**
And I think you've already kind of spotted some of the problems here.

**Wesley Donaldson | 14:34**
And I think you've already kind of spotted some of the problems here.

**Sam Hatoum | 14:36**
I saw in your comments, Antonio.

**Wesley Donaldson | 14:36**
I saw in your comments. Antonio yeah.

**Sam Hatoum | 14:40**
You know, when we first started this whole endeavor, I wanted everyone to use something called the DDK, something I built called the Domain Development Kit, which I later renamed the Narrative to the Narrative Development Kit.

**Wesley Donaldson | 14:41**
When we first started this whole endeavor, I wanted everyone to use something called the DDK, something I built called the Domain Development Kit, which I later rened to the Narrative Development Kit.

**Sam Hatoum | 14:51**
That was what I wanted everyone to use, but somehow we moved away from that framework and ended up creating our own, which meant that Kris would write something and Devi would write something, and it all ended up being different right now.

**Wesley Donaldson | 14:51**
That was what I wanted everyone to use, but somehow moved away from that framework and ended up creating our own, which meant that Chris would write something and DE will write something and it will end up being right now.

**Sam Hatoum | 15:05**
Again, mea culpa.

**Wesley Donaldson | 15:05**
Again, mea culpa.

**Sam Hatoum | 15:07**
I wasn't there to enforce it and we ended up frameworkless.

**Wesley Donaldson | 15:07**
I wasn't there to enforce it and we ended up frameworkless.

**Sam Hatoum | 15:12**
And I know Greg Young says he shouldn't use a framework, but strong frameworks.

**Wesley Donaldson | 15:12**
And I know Greg Young says you shouldn't use a framework, but strong frameworks.

**Sam Hatoum | 15:18**
Strong frameworks get people to, you know, fall into the pit of success or at least do some things.

**Wesley Donaldson | 15:18**
Strong frameworks get people to, you know, fall into the PA of success or at least reduce the things.

**Sam Hatoum | 15:23**
And if they can do it wrong, at least everyone does it in the wrong same wrong way.

**Wesley Donaldson | 15:23**
And if they can do it wrong, at least everyone does it in the wrong thing wrong way, right, mostly.

**Sam Hatoum | 15:28**
Right, mostly. So this brings it back to guess well, Emmett, yet again, because it's the framework.

**Wesley Donaldson | 15:30**
So this brings it back to guess what? And it yes again, because it's the right book.

**Sam Hatoum | 15:36**
So there is so many benefits we're going to get from using Emmett, and Stace agrees, right?

**Wesley Donaldson | 15:36**
So there is so many methods we're going to get from using met and states agrees right?

**Sam Hatoum | 15:41**
And then LMS being able to write code for us, which everyone's doing now.

**Wesley Donaldson | 15:41**
And then LMS be able to write code for us, which I on doing now havinging the right recipes and what have you for Emmett, along with the new documentation that I wrote for Oscar, which by the way, he loved strangely, he hates MS he's like, I'm really surprised at what you got them to do with the doc.

**Sam Hatoum | 15:46**
Having the right recipes and what have you for Emmett, along with the new documentation that I wrote for Oscar, which, by the way, he loved. Strangely, he hates LMS. He's like, I'm really surprised at what you got them to do with the doc. 
So yeah, and finally we have Oscar to come consult with us if we need to.

**Wesley Donaldson | 16:00**
So yeah, and finally, we have asked us to come consult with us if we need to.

**Sam Hatoum | 16:05**
Like I'm happy to always pay a bit of consulting with become helpers.

**Wesley Donaldson | 16:05**
Like I'm happy to always pay a little consulting with.

**Sam Hatoum | 16:09**
Okay, those are the problems that I saw.

**Wesley Donaldson | 16:09**
Okay, those are the problems that I saw.

**Sam Hatoum | 16:12**
Now I'm going to go open up for a bit discussion and then I want to go through your list as well, which I'm looking at in the chat right now.

**Wesley Donaldson | 16:12**
Now I'm going to go opening up for a little discussion and then we just go over something. Connect the shop right now.

**Sam Hatoum | 16:27**
No GOF Google. Go ahead. 
Antonio.

**Antônio Falcão Jr | 16:35**
I'm sorry.

**Wesley Donaldson | 16:35**
I'm sorry he's asking you to.

**Antônio Falcão Jr | 16:35**
I don't get your last. Point.

**Sam Hatoum | 16:38**
I was say yeah.

**Wesley Donaldson | 16:39**
Sorry, Antonio, he's asking you just to take us through your the issues that you identified and just your findings.

**Antônio Falcão Jr | 16:47**
Okay, perfect.

**Wesley Donaldson | 16:47**
Okay? Perfect.

**Antônio Falcão Jr | 16:48**
Yeah, pretty much what you have seen so dishandler that Rose asception case through ahs case it doesn't know a specific event rather than just bypass it so but it was more a design thing easy for us to address.

**Wesley Donaldson | 16:48**
Yeah, pretty much what you have seen. So dishandler that through asception case through zas case it doesn't know specific event rather than just bypass it. So but was more a design thing easy for us to address.

**Antônio Falcão Jr | 17:11**
The other one that concerns me a bit is the aggregate.

**Wesley Donaldson | 17:11**
The other one that concerns me a bit is the aggregatee looks like we have a small overhead on the gate because it does loops inside the dependency.

**Antônio Falcão Jr | 17:16**
Looks like we have a small overhead on the aggregate because it does, loops inside the dependency. It I we can load aggregate via aggregate ID, but then we have to pass back the ID to the function.

**Wesley Donaldson | 17:24**
It we can all aggregate via aggregate an ID, but then we have to pass back the ID to the function.

**Antônio Falcão Jr | 17:35**
That would be something that we could simplify, just make the state transition a simple pure function.

**Wesley Donaldson | 17:35**
That would be something that we could simplify just make the state transition a single peer function.

**Antônio Falcão Jr | 17:43**
No internal dependence to the aggregate.

**Wesley Donaldson | 17:43**
No internal dependence to the aggregate. Something like that.

**Antônio Falcão Jr | 17:46**
Something like that. Let me see.

**Wesley Donaldson | 17:51**
Let me see.

**Antônio Falcão Jr | 17:51**
What else?

**Wesley Donaldson | 17:51**
What else?

**Antônio Falcão Jr | 17:54**
The other one that concerns me a bit, but maybe, a bit more hard to decide and change this to specialize the stream per process.

**Wesley Donaldson | 17:54**
The other one that concerns me a bit but maybe a bit more hard to decide. 
And changes to specialize the screener process.

**Antônio Falcão Jr | 18:05**
Now we have one, one stream, different events from different process, and that may have a reason for that.

**Wesley Donaldson | 18:05**
Now we have one one stream different events from different process and that may have a reason for that.

**Antônio Falcão Jr | 18:13**
So you can point me out what is the point with this?

**Wesley Donaldson | 18:13**
So you can point me out what is the point with this?

**Antônio Falcão Jr | 18:19**
But, if we could segregate or specialize the streams, we could either gain some performance and mitigate some, you know, general issues with projections, handlers and so on, if that makes sense for you.

**Wesley Donaldson | 18:19**
But if we could segregate or specialize the streams, we could either gain some performance and mitigate some, you know, general issues with projections handles. And so on, if that makes sense for you. 
Well, when you say a process, can you just define like what you mean by process?

**Sam Hatoum | 18:39**
Well, when you say per process, can you just define like what you mean by process?

**Antônio Falcão Jr | 18:46**
Yes, that's DDD part of.

**Wesley Donaldson | 18:46**
Yeah, that's the DD part of it.

**Antônio Falcão Jr | 18:49**
I would have to work a bit on that to bring better suggestions.

**Wesley Donaldson | 18:49**
I would have to work a bit on that to bring various suggestions.

**Antônio Falcão Jr | 18:53**
But participant may be a bed or something that we could consider a process.

**Wesley Donaldson | 18:53**
But participant may be about that or something that we could consider a process.

**Antônio Falcão Jr | 18:58**
I'm not entirely sure about that now, but.

**Wesley Donaldson | 18:58**
I'm not very sure about that now, but yeah, I see, yeah, I mean the open arena, no problem for you to design streams, redesign streams and migrate streams, stuff like a that will make sense.

**Sam Hatoum | 19:03**
Gussy yeah, I mean, I like open Arena. No problem if we need to design streams or redesign streams and migrate streams and stuff like absolutely, if that's what makes sense. No wor is there.

**Wesley Donaldson | 19:13**
Nowhere is there.

**Sam Hatoum | 19:14**
And I'm wanting to practice that muscle a little bit, but no problems from my side, I think.

**Wesley Donaldson | 19:15**
Want to practice that muscle end? Little bit. 
But no problems in my side I think.

**Sam Hatoum | 19:20**
But I relied a lot on Dev to design the streams.

**Wesley Donaldson | 19:20**
But I really I rely a lot on Dev to design the trees is pretty good.

**Sam Hatoum | 19:27**
It's pretty good at that. So I think if one thing I would look at is go to the event store and just have a look for anything you want to redesign, just how many events are in there because I believe you'll find they're very short.

**Wesley Donaldson | 19:29**
So I think if one thing I would look at is go to the event store and just have a look at anything you want to redesign, just how many events are in there because I believe we find it very short.

**Sam Hatoum | 19:41**
I could be wrong, but I don't think we have very long streams even for something like participant because they just don't do much but agree.

**Wesley Donaldson | 19:41**
Could be wrong, but I don't think we have very long SES even for something like participants because they just don't do much. 
But I agree.

**Sam Hatoum | 19:51**
Like, I think, it's absolutely worth a look for that.

**Wesley Donaldson | 19:51**
Like I think, it's absolutely worth a look for that.

**Sam Hatoum | 19:57**
But that I would say, is probably like.

**Wesley Donaldson | 19:57**
But that, I would say, is probably like happy to be talked down from this, but I would imagine redesigning the stres is probably a second order improvement rather than the first ones, which are agree she's in the face completely.

**Sam Hatoum | 20:00**
Happy to be talked down from this, but I would imagine redesigning the streams is probably a second order improvement rather than the first ones, which are punches in the face completely.

**Antônio Falcão Jr | 20:14**
Yeah, I agree.

**Wesley Donaldson | 20:14**
Yeah, I agree.

**Antônio Falcão Jr | 20:16**
I do agree with you that the most part of it can be well addressed in the design level, in my opinion.

**Wesley Donaldson | 20:16**
I do agree with you that the most part of it can be well addressed in the design level, in my opinion. 
Yeah, so what I said is like, let's now talk about when.

**Sam Hatoum | 20:25**
So what I said is like, let's now talk about when. Okay.

**Wesley Donaldson | 20:31**
Okay.

**Sam Hatoum | 20:31**
Like what and when?

**Wesley Donaldson | 20:31**
Like what and when?

**Sam Hatoum | 20:32**
So what is?

**Wesley Donaldson | 20:32**
So what is?

**Sam Hatoum | 20:34**
We should be using EMET across the board.

**Wesley Donaldson | 20:34**
We should be using EMIT across the board.

**Sam Hatoum | 20:37**
And then let's just define like what our overall simplified architecture is like.

**Wesley Donaldson | 20:37**
And then let's just define like what our overall simplified architecture is like.

**Sam Hatoum | 20:45**
It really should be as simple as the following.

**Wesley Donaldson | 20:45**
It really should be as simple as the following.

**Sam Hatoum | 20:48**
New command handlers.

**Wesley Donaldson | 20:48**
New command handlers.

**Sam Hatoum | 20:49**
So commands come in from the web on various places, I mean, and they go through some decider logic to write an event right?

**Wesley Donaldson | 20:49**
So commands come in from the web from various places. I mean, and they go through some decider logic to write an event right?

**Sam Hatoum | 21:01**
Once that, that's business rules all the hard stuff.

**Wesley Donaldson | 21:01**
Once that that's business rules all the hard stuff.

**Sam Hatoum | 21:03**
Stream design.

**Wesley Donaldson | 21:03**
Stream design.

**Sam Hatoum | 21:05**
This is where we get the more brainy people to work on it, right?

**Wesley Donaldson | 21:05**
This is where we get the more brainy people to work with.

**Sam Hatoum | 21:08**
So we want a group of people there to talk about what goes into a stream, what's across streams.

**Wesley Donaldson | 21:08**
So we want a group of people there to talk about what goes into a stream, what's across streams.

**Sam Hatoum | 21:13**
Antonio.

**Wesley Donaldson | 21:13**
I'm telling you. This is what you're here to do?

**Sam Hatoum | 21:14**
This is what you're here to do? Really?

**Wesley Donaldson | 21:15**
Really?

**Sam Hatoum | 21:16**
To help with this part, Ma more than anything.

**Wesley Donaldson | 21:16**
To help with this part. Ma more than meeting.

**Sam Hatoum | 21:20**
And, you know, walk them off from the ledge for.

**Wesley Donaldson | 21:20**
Then, you know, walk them off from the ledge for, you know, from shooting themselves in the foot, doing bad things here.

**Sam Hatoum | 21:23**
Or, you know, from shooting themselves in the foot and doing bad things here. 
Like this is where you'll apply your DDD skills and just get us into an instinct to get to good Streams and Designs at the hardest part of the system, which is the right side where you write things.

**Wesley Donaldson | 21:28**
Like this is where you'll apply your D skills and just get us into our instincts to get to good Streets and Designs at the as of the system, which is the right side where you write things.

**Sam Hatoum | 21:43**
So that's part one, the right side, which incidentally in my mind is on the left side, but it doesn't matter, it's the writing side.

**Wesley Donaldson | 21:43**
So that's part one, the right side, which incidentally, in my mind is on the left side, but it doesn't matter, it's the right in side.

**Sam Hatoum | 21:51**
So first it comes in from wherever it is, goes through the business in variant, the rules, then it gets written or not written as an event.

**Wesley Donaldson | 21:51**
So first it comes in from wherever it is, goes through the business in variance, the rules, then it gets written or not written as an event.

**Sam Hatoum | 22:01**
Great job done.

**Wesley Donaldson | 22:01**
Great job done.

**Sam Hatoum | 22:02**
End of process.

**Wesley Donaldson | 22:02**
End of process.

**Sam Hatoum | 22:04**
That should be all done using emmitt, deciders, evolvers, all of that good stuff.

**Wesley Donaldson | 22:04**
That should be all done using EMIT, deciders, evolvers, all of that good stuff.

**Sam Hatoum | 22:11**
Then it goes to projections again within Emmett, it has its internal machine that is very good at calculating projections as a result.

**Wesley Donaldson | 22:11**
Then it goes to projections again within and it has its internal machine that is very good at calculating projections as a result.

**Sam Hatoum | 22:20**
And I think actually you can even configure it in a way that it's locking.

**Wesley Donaldson | 22:20**
And I think actually we can configure it in a way that it's locking.

**Sam Hatoum | 22:25**
So it's not even like you can choose.

**Wesley Donaldson | 22:25**
So it's not even like you can choose you can select between whether you want to have eventual consistency or not.

**Sam Hatoum | 22:28**
You can select between whether you want to have eventual consistency or not like you can you.

**Wesley Donaldson | 22:33**
Like if you can I believe, if I'm not mistaken, you can get it so that it wris and it waits for the right.

**Sam Hatoum | 22:34**
I believe, if I'm not mistaken, you can get it so that it write and it waits for the right. 
You know what I'm talking about, Antonio?

**Wesley Donaldson | 22:39**
You know what I'm talking about. So absolutely.

**Antônio Falcão Jr | 22:41**
Absolutely. It's going to be a block in projection or a sync one like in behind a sy.

**Wesley Donaldson | 22:41**
It's going to be a block in projection or a sync one.

**Sam Hatoum | 22:48**
So wherever we have some, you know issue where in the past dev decided that you know what?

**Wesley Donaldson | 22:48**
So wherever we have some issue where in the past they decided that you know what?

**Sam Hatoum | 22:53**
This should be a projection inside a connector on a case by case basis.

**Wesley Donaldson | 22:53**
This should be a projection inside a connector on a case by case basis.

**Sam Hatoum | 22:57**
We can instead opt to block them until they write, and that way we can ensure the, you know, get mitigating the eventual consistency problem, which is what traditional databases do anyway.

**Wesley Donaldson | 22:57**
We can instead opt to block them until they write. 
And that where we can ensure that mitigate the eventual consistency of which a more traditional database than do anyway.

**Sam Hatoum | 23:06**
But like, just bear that in mind, right?

**Wesley Donaldson | 23:06**
But like just bear that anyone, right?

**Sam Hatoum | 23:08**
So there's the projection part.

**Wesley Donaldson | 23:08**
So there's the projection part.

**Sam Hatoum | 23:09**
So since EMIT does that, then that's part two of the process is we get data out of the event stores into a relational database.

**Wesley Donaldson | 23:09**
So since n it does that, then that's part two of the process is we get data out of the event stores into a relational database.

**Sam Hatoum | 23:20**
Right? Okay, right, because when we do that, we've now enabled everybody at it from any company anywhere to come in and be able to use this system, right?

**Wesley Donaldson | 23:22**
Because when we do that, we've now enabled everybody from any company anywhere to come in and be able to use this system, right?

**Sam Hatoum | 23:34**
So if because then, you know, part one is ingestion of data into events, the recording of events is part one, part two is the projection of data, and part three is the reading of data and the querying of data, which is where graph QL and things like that come.

**Wesley Donaldson | 23:34**
So if we. Because then part one is ingestion of data into events. The recording of events is part one, part two is the projection of data, and part three is the reading of data and the querying of which is where graph Q are and things like that.

**Antônio Falcão Jr | 23:51**
Okay, yeah, that makes sense.

**Wesley Donaldson | 23:51**
Okay, yes, that makes sense.

**Sam Hatoum | 23:53**
All right, so those are the three layers that we need to basically just create.

**Wesley Donaldson | 23:53**
All right, so those are the three layers that we need to basically just create.

**Sam Hatoum | 23:56**
And the way that I like to think about it is any developer can do come and do resolvers and things like that.

**Wesley Donaldson | 23:57**
And the way that I want to think about it is any developer can do come and do resolvers and things like that.

**Sam Hatoum | 24:03**
That's easy.

**Wesley Donaldson | 24:03**
That's easy.

**Sam Hatoum | 24:04**
It's not a problem.

**Wesley Donaldson | 24:04**
It's not a problem because, you know, if AMAL processes, they're stateless and most of the time unless they have some data loading, you fetching and caching, but that's okay.

**Sam Hatoum | 24:05**
It's, you know, they're ephemeral processes, they're stateless and most of the time, unless they have some data loading and fetching and caching, but that's okay. That's all up there, right?

**Wesley Donaldson | 24:12**
That's all of that.

**Sam Hatoum | 24:13**
That's good.

**Wesley Donaldson | 24:13**
That's good.

**Sam Hatoum | 24:15**
In the middle layer, the projections.

**Wesley Donaldson | 24:15**
In the middle layer, the projections.

**Sam Hatoum | 24:17**
Most people can write projections.

**Wesley Donaldson | 24:17**
Most people can write projections.

**Sam Hatoum | 24:18**
Maybe some frontenders might have some trouble, but Harry Dane, you know, Lance, they can look at it go.

**Wesley Donaldson | 24:19**
Maybe some front enders might have some trouble, but Harry Dane Mos they can look at it.

**Sam Hatoum | 24:25**
Yeah, I can see that.

**Wesley Donaldson | 24:25**
Yeah, I can see that.

**Sam Hatoum | 24:26**
I get the projections out and I project them into a database if else if this case do that like it's pretty easy, right?

**Wesley Donaldson | 24:26**
I guess the projections are so if else if this case do that like it's pretty easy restant home doing decent back end developation of projections and then the right side.

**Sam Hatoum | 24:31**
It's not hot. If you're a decent back end developer, you should have projections and then the right side. Well, you have to know a little bit more about that.

**Wesley Donaldson | 24:37**
Well, you have to know a little bit more about that.

**Sam Hatoum | 24:39**
So it's a little bit more complex.

**Wesley Donaldson | 24:39**
It's a little bit more complex.

**Sam Hatoum | 24:40**
You have to just know, understand streams and you know, bit some DDD concepts and things like that.

**Wesley Donaldson | 24:40**
You have to understand streams and, you know, DEP bits, some DVD concepts and things like that.

**Sam Hatoum | 24:45**
But hey, that's what we use.

**Wesley Donaldson | 24:45**
But hey, that's what we use Xolv and our health for.

**Sam Hatoum | 24:47**
Zovia and our help for that's it.

**Wesley Donaldson | 24:49**
That's it.

**Sam Hatoum | 24:50**
Those are the three parts of this machine we've got to create.

**Wesley Donaldson | 24:50**
Those are the three parts of this machine that cre on.

**Sam Hatoum | 24:52**
Antonio.

**Antônio Falcão Jr | 24:53**
Okay, that makes sense for me.

**Wesley Donaldson | 24:53**
Okay, that makes sense for me.

**Antônio Falcão Jr | 24:55**
Yeah, right.

**Wesley Donaldson | 24:55**
Yeah, right.

**Sam Hatoum | 24:56**
So that's what we got to get to now, that's the what?

**Wesley Donaldson | 24:57**
So that's all we're going to get to now that's the what that's the toy st now how we get there and when I think there's not too much thankfully there's not too much for us to do like it's not a huge system yet it's only results that we're getting in, but there's really not very much.

**Sam Hatoum | 25:00**
That's the target state now how we get there. And when I think there's not too much thankfully there's not too much for us to do. Like it's not a huge system yet. 
It's only results that we're getting in. Like there's really not very much. And then orders come in right now by way of like an S3 bucket and so on.

**Wesley Donaldson | 25:15**
And then orders come in right now. By way of like an S. Three bucket and so on.

**Sam Hatoum | 25:19**
But soon, like, Stas wants to refactor and strangle out, the orders.

**Wesley Donaldson | 25:19**
But soon, like STS wants to refactor and strangle out the orders so their own number come from CSTAR they'll now come directly from the cry, so that cuts out that process entirely.

**Sam Hatoum | 25:25**
So they're no longer come from CSTAR, they'll now come directly from Curley. So that cuts out that process entirety. And now we have orders coming in.

**Wesley Donaldson | 25:32**
And then we have orders coming in.

**Sam Hatoum | 25:34**
So for these orders, we must be using Gammet.

**Wesley Donaldson | 25:34**
So for these orders, we must be using them. And this new pipeline, you know, this new progression of the three stage system that I mentioned, it must be in place where the recovery go.

**Sam Hatoum | 25:36**
And this new pipeline, you know, this new progression of the three stage system that I mentioned, it must be in place for the recurring work. 
Okay. And then for the results results are going to start coming.

**Wesley Donaldson | 25:46**
And then for the results results are going to start coming.

**Sam Hatoum | 25:51**
I mean, right now, there's two parts to the results.

**Wesley Donaldson | 25:51**
I mean right now they's two positive results.

**Sam Hatoum | 25:54**
Some of them come straightest to thrive.

**Wesley Donaldson | 25:54**
Some of them come straightest to thrive, and some of them, like the labs, I think the lab results come straight to five.

**Sam Hatoum | 25:56**
And some of them, like the labs, I think the lab results come straight to thrive. We actually ingest them directly.

**Wesley Donaldson | 26:00**
We actually ingest them directly.

**Sam Hatoum | 26:02**
And then there's some results that still come from CSTOCK.

**Wesley Donaldson | 26:02**
And then there's some results that still come from CTO I don't know exactly how, but there's some still that come from CST but I believe those are like maybe through THEOCS ship went up.

**Sam Hatoum | 26:07**
I don't know exactly how, but there's some still that come from CSTOCK. I believe those are much maybe through the S three Buccios and shit like that. 
So he wants to, you know, at some point we have to address like we there's some work sched scheduled to start soon that Stas wants us to then, you know, take this opportunity to refactor the results system to use Emmett as well.

**Wesley Donaldson | 26:15**
So he wants to, you know, at some point we have to address that there's some work schedules to start soon. That space wants us to then take this opportunity to react to the results system to use MMA as well.

**Sam Hatoum | 26:32**
So what he doesn't want us to do is stop the bus and refactor.

**Wesley Donaldson | 26:32**
So what he doesn't want us to do is stop the bus and refactor.

**Sam Hatoum | 26:35**
We had the whole of January, November in December to do that.

**Wesley Donaldson | 26:35**
We had the whole of Janet in November and December. We.

**Sam Hatoum | 26:39**
But now his board has very little patience for anything else.

**Wesley Donaldson | 26:39**
But now this board has very little patience for anything else.

**Sam Hatoum | 26:43**
So if they're, you know, if they're asking for something like, hey, we want recurli, it's like, okay, well, part of that recurly there's a cost, and that cost is some refactoring.

**Wesley Donaldson | 26:43**
So if they're, you know, if they're asking for something like, hey, we want to recurring, it's like, okay, we're part of that recurring. There's a cost, and that cost is some refactoring.

**Sam Hatoum | 26:50**
That's okay.

**Wesley Donaldson | 26:50**
That's okay.

**Sam Hatoum | 26:51**
And if, you know now we're changing something, we're strangling out C stuff for results and we're moving into entirely to thrive again, that's like, okay, there's a bit of refactoring work and we can factor in this ET cost into that.

**Wesley Donaldson | 26:51**
And if you know now we're changing something, we're strangling our seastock the results and moving into entirely to thrive again, that's like okay, it's a very refactory work and we can factor in this m cost into that makes sense.

**Sam Hatoum | 27:03**
Makes sense.

**Antônio Falcão Jr | 27:05**
Makes sense.

**Sam Hatoum | 27:05**
Yeah. All right, so we've got two opportunities here to refactor the system or start, you know, for recurly, it's start brand new with e it.

**Wesley Donaldson | 27:06**
All right, so we've got two opportunities here to refactor the system or start in for recur it, start brand new within it, or results.

**Sam Hatoum | 27:13**
For results, it's half and half.

**Wesley Donaldson | 27:16**
It's half and half.

**Sam Hatoum | 27:17**
Some of it's existing in results, some of it's not.

**Wesley Donaldson | 27:17**
Some of it's existing in results, some of it.

**Sam Hatoum | 27:20**
Now the results processing that we have in there, that whole object oriented shit, it's probably okay.

**Wesley Donaldson | 27:20**
And the results processing that we have in there, that whole object oriented shit, it's probably okay.

**Sam Hatoum | 27:25**
Like, I think if you just pack it into an independent module, I don't think it's too bad because it's like just a results processor.

**Wesley Donaldson | 27:25**
Like, I think if you just pack into an independent module, I don't think it's too bad because it's like just the results processor.

**Sam Hatoum | 27:31**
You can probably just package it up into a single module and just treat it as a black box.

**Wesley Donaldson | 27:31**
You can probably just package it up into a single module and just treat it as a black box.

**Sam Hatoum | 27:36**
Okay, so progression now let's talk about how we're going to execute on all this.

**Wesley Donaldson | 27:39**
So progression now let's talk about how we're going to execute on all this wisely.

**Sam Hatoum | 27:43**
And Wesley, this is now when you come in, please ask any questions.

**Wesley Donaldson | 27:44**
This is now when you please w us ask any the first issue I see is we're we don't have any events currently in the recurring scope, but what we have right now is we're just doing everything up to the checkout.

**Sam Hatoum | 27:47**
And I've just been, like, zooming along. Any anything outstanding from you.

**Wesley Donaldson | 28:03**
But immediately, I would say within the next two weeks, we're going to be having the other side of the conversation. It is now we have to get orders coming out of recurrently. So the conversation the discussion of everything new for recurring needs to go through and that would need to be solved in the next like architecture session plan attack in the next two weeks, a precursor to all of that.

**Sam Hatoum | 28:18**
Right? Right, exactly. So the precursor to all of that, now that you've all got the full picture and we're walking backwards and this is the wax on, wax off moment and the Karate Kid is the is that we are going to do a single hello World EMIT application.

**Wesley Donaldson | 28:28**
Now you all look at the full picture and we're walking backwards. 
And this is the wax on, wax off moment reference. Good job. Is that we are going to do a single world end application.

**Sam Hatoum | 28:41**
We need to push that into the pipeline.

**Wesley Donaldson | 28:41**
We need to push that into the pipeline.

**Sam Hatoum | 28:44**
It has an innocuous.

**Wesley Donaldson | 28:44**
It has an innocuous.

**Sam Hatoum | 28:45**
You know, all the three parts of the pipeline that I mentioned event creating, event recording of the events, read model, projections and queries.

**Wesley Donaldson | 28:45**
You know, all the three parts of the pipeline that I mentioned event creating, event recording on the events, reading on the projections and queries.

**Sam Hatoum | 28:56**
Those three need to all be proven in a hello World application that.

**Wesley Donaldson | 28:56**
Those three need to all be proven in a hello World application that I ment are built with in the cap like we need to schedule this work starting like AAP so you know somehow we're going to squeeze that into the rest of the priorities and it's coming in from me in space to do that work.

**Sam Hatoum | 29:01**
Antonio you're going to build with in the cut like we need to schedule this work starting like ASAP so, you know, somehow we've got to squeeze that into the rest of the priorities. 
And it's coming in from me and Stace to do that work. So we just got to make sure the team is executing on that.

**Wesley Donaldson | 29:15**
So we've got to make sure the team is executing on that.

**Sam Hatoum | 29:17**
But the team as in you ant and you're here and any help you need, I want to support you.

**Wesley Donaldson | 29:17**
While the team has in you at to your head and the help you need, I want to support you.

**Sam Hatoum | 29:21**
I want to make sure this is going to work.

**Wesley Donaldson | 29:21**
I want to make sure this is going to work.

**Sam Hatoum | 29:22**
And so that way we've got our standing like our place placeholder along with a bunch of clawed skills and links to the documentation and MS and things like that.

**Wesley Donaldson | 29:22**
And so that way we've got our standing like our place placeholder along with a bunch of CLO skills and linked to the documentation and MT and things like that shouldn't take us too long because it's a very simple three part process and it's not being driven by any business requirements yet.

**Sam Hatoum | 29:32**
Shouldn't take us too long because it's a very simple, you know, three three part process and it's not being driven by any business requirements yet. 
But it sets the scene, it gets it into the infrastructure.

**Wesley Donaldson | 29:39**
But it sets the scene, it gets it into the infrastructure.

**Sam Hatoum | 29:42**
We can see either you know, the locking patent for locking projections versus non locking projections.

**Wesley Donaldson | 29:42**
We can see either, you know, the mocking patent for mocking projections versus non mocking projections.

**Sam Hatoum | 29:47**
We can see the pattern for recording events with the decider and evolve pattern, and we can see the querying of that data from read models using GRAPHQL so we prove everything that I just said makes sense.

**Wesley Donaldson | 29:47**
We can see the pattern for recording events with the decideder and evolved pattern, and we can see the querying of that data from re modes using GRAPHQO. 
So we pro everything that I just said make acknowledged question on how to roll it out the first three things.

**Sam Hatoum | 30:02**
Sense?

**Wesley Donaldson | 30:10**
Four thing first three things does sound more immediate, but I guess my question is should we tackle those first or should is the current state stabilized enough where we can focus on EMIT?

**Sam Hatoum | 30:25**
Yeah, sorry.

**Wesley Donaldson | 30:25**
Yeah, sorry.

**Sam Hatoum | 30:26**
So even before that.

**Wesley Donaldson | 30:26**
So even before that.

**Sam Hatoum | 30:27**
Correct.

**Wesley Donaldson | 30:27**
Correct.

**Sam Hatoum | 30:27**
Like there's just a few things like I think the first one is just making sure that we don't have any projections they're going to trip us over again with any like exceptions being thrown.

**Wesley Donaldson | 30:27**
Like there's just a few things like I think the first one is just making sure that we don't have any projections they're going to trick us over again, like exceptions. I don't think that's to happen immediately.

**Sam Hatoum | 30:36**
I think that's actually that clean enough needs to happen first, immediately. Right now.

**Wesley Donaldson | 30:40**
Perfect.

**Sam Hatoum | 30:41**
Yeah. I think it's worth having a look at the S library to see if we can just configure it such that it's, you know, got the, you know, required by default off.

**Wesley Donaldson | 30:42**
I think it's worth having a look at the library to see if we can just configure it such that it's, you know, got the, you know, acquired by default off.

**Sam Hatoum | 30:55**
It's probable we could, you know, maybe there's something we can do there, or at the very least just, you know, communicate that back out to people, or even maybe an even easier thing.

**Wesley Donaldson | 30:55**
It's probable we could, you know, maybe there's something we can do there. At the very least just communicate that back out to people, or even maybe an even easier thing.

**Sam Hatoum | 31:03**
Actually, a quickest thing would be just to put a code orders on anything that touches that library that comes to you.

**Wesley Donaldson | 31:03**
Actually, the quickest thing would be just to put a codes on anything that touches that library that comes to you own.

**Sam Hatoum | 31:09**
Antonio.

**Antônio Falcão Jr | 31:12**
I see.

**Wesley Donaldson | 31:12**
I see.

**Antônio Falcão Jr | 31:12**
Okay.

**Wesley Donaldson | 31:12**
Okay, well, that's probably the easiest thing to now, but we just want to stop the lea.

**Sam Hatoum | 31:14**
All right, that's probably the easiest thing between. Now, like, we just want to stop the bleeding. We don't want to necessarily fix it right now.

**Wesley Donaldson | 31:17**
We don't want to necessarily fix it right now.

**Sam Hatoum | 31:19**
We just want to like if our legs broken, we just want to limp along, right?

**Wesley Donaldson | 31:19**
We just want to like if our legs broken. We just want to live a long and full a bandage on.

**Sam Hatoum | 31:23**
Just put a bandage on it. Let's fucking walk.

**Wesley Donaldson | 31:24**
So and you know, let's just get to the point where we can replace everything with ET and that's the target that we want to be as quick as possible.

**Sam Hatoum | 31:25**
And, you know, let's just get to the point where we can replace everything with Emmett. And that's the target that we want to be in as quick as possible. So yeah, patch everything that needs to be patched.

**Wesley Donaldson | 31:32**
So yeah, patch everything that needs to be patched.

**Sam Hatoum | 31:34**
In the meantime we do which to me right now is, you know, removing any exception throwing putting some even like with the can let's see, put code donors.

**Wesley Donaldson | 31:34**
In the meantime we do which to me right now is you know, removing any exception for putting some even like with they can, let's see, put code owners.

**Sam Hatoum | 31:47**
That's a good one, I think.

**Wesley Donaldson | 31:47**
That's a good one. I think of everything that needs code owners.

**Sam Hatoum | 31:48**
Just Pat patched up everything that needs code donors so it comes to you and that's probably enough, and then you can get started on the ememit.

**Wesley Donaldson | 31:50**
So it comes to you and that's probably enough and then you can get started on the EMIT.

**Sam Hatoum | 31:55**
It's not spike, it's not a POC it's, like initial INF let's just call it like the initial Emitt patterns, like establishing.

**Wesley Donaldson | 31:55**
It's not spike, it's not POC, it's like initial interest. Let's just call it like the initial end patents, okay? 
Like establishing.

**Sam Hatoum | 32:03**
I don't want to say anything called refactoring or infrastructure or POC or a spike.

**Wesley Donaldson | 32:03**
I don't want to say anything called refactoring or infrastructure or PC or spike.

**Sam Hatoum | 32:09**
I want it to be like groundwork laying the mic laying the recurring groundwork.

**Wesley Donaldson | 32:09**
I want it to be like groundwork laying the recurring groundwork.

**Sam Hatoum | 32:13**
That's what it should be phrased as.

**Wesley Donaldson | 32:14**
That's what it should be. We have an enablement epic, which has gotten good support from like states in the past. 
I think he's. And Jennifer has been able to push that with product and the powers that be so that we can just wrap this underneath that. And I think the video is pretty clear to me.

**Sam Hatoum | 32:29**
Great. Yeah.

**Wesley Donaldson | 32:32**
Yeah.

**Sam Hatoum | 32:32**
So then three, three things in there.

**Wesley Donaldson | 32:32**
So then three things. Interns.

**Sam Hatoum | 32:33**
I like the three patterns, which is recording of events, projections, event sorry, event storage patterns what do you call that?

**Wesley Donaldson | 32:35**
Which is? Recording of events projections event storage patterns what we call that and recording business patterns, command patterns that's say command patterns, projection patterns and query patterns the three things we need to be having first.

**Sam Hatoum | 32:43**
Event recording, business rule patterns, command patterns. Let's say command patterns, projection patterns and query patterns. The three things we need to be to have in that's it. 
Alright.

**Wesley Donaldson | 32:54**
We using Emmett es call them emmet commands and projections and eme queries.

**Sam Hatoum | 32:54**
Using Emmett you can you just call them Emmett commands, emme projections and eme queries. And now we've got the complete system and the next.

**Wesley Donaldson | 33:01**
And now we've got the complete system and the next time we can vtrate plus Claude skills around them.

**Sam Hatoum | 33:04**
And then we can. And so plus Claude skills around them all. 
Okay, that's the pattern.

**Wesley Donaldson | 33:09**
That's the pattern.

**Sam Hatoum | 33:10**
Now, at the very least, people can be giving you PRs antio and to mean to everyone else, and you can at least have a structured way of doing it right?

**Wesley Donaldson | 33:10**
Now, at the very least, people can be giving you PRs and turn you to meeting everyone else. 
And we can at least have a structured way of doing it right.

**Sam Hatoum | 33:20**
And we can be contributing to edit, to EMIT and so on.

**Wesley Donaldson | 33:20**
And we can be contributing together to EMIT and so. And that puts us an in spot as far as bandwidth is concerned.

**Sam Hatoum | 33:23**
And that puts us in a clean spot.

**Wesley Donaldson | 33:30**
Antonio you like the stuff that we originally had forecasted for you, like you're all this kind of took all that stuff. 
So you have bandwidth technically on the board unless, like, I know you're working through that one issue regarding the dead letter queue, if you can close that out sooner. Actually, let me rephrase that. That sounds like a higher priority because that's missed events that we need to handle. It sounds like they were related to the PDFS.

**Antônio Falcão Jr | 34:02**
Go aheadm sorry.

**Wesley Donaldson | 34:02**
Go ahead, sorry, no, I just said definitely sorry, you go ahead.

**Sam Hatoum | 34:04**
No, I just said definitely sorry, you go ahead.

**Wesley Donaldson | 34:06**
Okay, yeah, go ahead. Sorry, Tony, you go ahead.

**Antônio Falcão Jr | 34:10**
Yeah, that. Yeah, I have AI have a plan in place already, so I just.

**Wesley Donaldson | 34:11**
Yeah, I have a plan in place already, so I just wanted to better structure it and share with you guys.

**Antônio Falcão Jr | 34:15**
I just wanted to better structure it and share with you guys. If that's good enough we can just give to someone to execute or I can execute it right away.

**Wesley Donaldson | 34:19**
If that's good enough we can just give to someone to execute or I can execute it right away. 
So but it's it will be pretty much around I script that make some direct le inocation to list as three objects and then create some synthetic S3 events to trigger again the process me how has bandwidth if it's something that could be a good fit that we can hit two priorities all at once.

**Antônio Falcão Jr | 34:27**
So but it's it will be pretty much around a script that make some direct Lembeda invocation to list the as 3 objects and then create some synthetic S3 events to trigger again the process. So I found. 
Absolutely.

**Sam Hatoum | 34:57**
Is something that. Meha. Okay.

**Wesley Donaldson | 35:00**
Yeah, well, I was going to suggest that me how which is Bob be mine, but you could do it potentially to Harry or Dane because under the guise of we need to train you guys how to do this da light well, Dane doesn't have anything left from Mandalor.

**Sam Hatoum | 35:00**
Yeah, well, I was going to suggest other Meha, which would be fine, but you could give it potentially to Harry or Dane, because under the guise of. We need to train you guys how to do this work.

**Wesley Donaldson | 35:18**
And he was supposed to be allocated to Mandalor for the next two weeks.

**Sam Hatoum | 35:21**
So that would make sense. Just hand it off to him and then support him because it helps them going forward being able to run this sort of stuff.

**Wesley Donaldson | 35:22**
Just hand it off to him and then support him because it helps them going forward being able to run this sort of stuff. And I think the two candidates, the three candidates that I have that can do the event sourcing work on the right side are Dane, Harry and Lance, actually.

**Sam Hatoum | 35:28**
And I think the two candidates, the three candidates that I have that can do the event sourcing work on the right side are Dane, Harry and Lance. Actually.

**Wesley Donaldson | 35:46**
Thank you.

**Sam Hatoum | 35:46**
Can you hear me? 
Okay? Yeah. Yeah. It's. I was going through a little shit. Shitty patch here. That's what I'm asking.

**Wesley Donaldson | 35:51**
That's why I'm asking. Yeah. I'm pretty open minded. I think I'd probably just ask Harry who he wants to work on it and just say, here we have, like us own the proposal. Here's what we need to do. 
And then just have him choose who's available to work on it. Okay, done. And then we can start. So then you'll write that up. Let's say that's a day or so. And then we can get the tickets in place for the immediate work on resolving the existing known issues with how we're with the architecture around event sourcing. 
And then we'll have the EMIT stuff probably start next week. That's that sound reasonable? 
Cool. All right, I'll write it up and it looks like that and told you that should be your next three items or three buckets of items. There's nothing else, as I mentioned on the board critical for you right now, you may have to support some of the API stuff, but.

**Sam Hatoum | 36:55**
Correct.

**Wesley Donaldson | 36:56**
And we need to solve that access right issue. I'm not sure if it's I think it's on the Google Place API maybe.

**Antônio Falcão Jr | 37:04**
That that's done already I and yeah, have you did you have the opportunity to see my.

**Wesley Donaldson | 37:05**
That that's there go yeah, I have not checked it since yeah, I have not everything is working out okay, man, read the environment perfect.

**Antônio Falcão Jr | 37:12**
No problem, everything is working out on every environment. Yeah.

**Wesley Donaldson | 37:20**
All right, I will write it up for you and let's say we have a good plan.

**Antônio Falcão Jr | 37:24**
Perfect, okay, no, that's okay.

**Wesley Donaldson | 37:29**
That's okay. Sam, if you want to connect for a couple of minutes or if you need the time, that's fine too.

**Sam Hatoum | 37:34**
Sure, yeah, there's no us keep going by guys.

**Wesley Donaldson | 37:36**
Okay, Antonio. Thank you, sir.

**Sam Hatoum | 37:43**
Okay, not so good mum.

**Wesley Donaldson | 37:45**
This hopefully it could be quick and you get some time back. Kind of like the what I'm looking for is kind of what you shared with me this morning in TQ internal around Ruben. I was out for a week. 
So there's always there's things that go on other than just ticket status. I'm curious if you one had any feedback from Stas. I saw the his thoughts around the I enablement session. Great. Anything like that is what I'm looking for. Anything that I missed last week or I should be aware of mistakes.

**Sam Hatoum | 38:10**
Yeah, sure, man. Yeah. So I mean, yeah, the be I had a one to one mistakes. You know, there's this issue that happened with them thinking this is just let's do some PDF generation, an innocuous change.

**Wesley Donaldson | 38:15**
You know, there's this issue that happened with them thinking this is just, let's do some PDF generation and innocuous change.

**Sam Hatoum | 38:22**
And it kind of broke the world.

**Wesley Donaldson | 38:22**
We kind of broke the world.

**Sam Hatoum | 38:23**
It's like, wait a minute, stay flipped his like, not flipped to he's like he came and asked, but very much like.

**Wesley Donaldson | 38:23**
It's like wait a minute. Stays like not liter like he came in asked but very much like a you know, Sam, we're about to go into this recurring thing.

**Sam Hatoum | 38:29**
You know, Sam, we're about to go into this recurring thing. I cannot fail.

**Wesley Donaldson | 38:32**
I cannot fail.

**Sam Hatoum | 38:33**
You know, I cannot possibly fail with the business.

**Wesley Donaldson | 38:33**
I cannot possibly fail with the business.

**Sam Hatoum | 38:35**
Like, this is basically his job and our job and everyone.

**Wesley Donaldson | 38:35**
Like, this is basically his job and our job and everyone.

**Sam Hatoum | 38:38**
Like, it's not he can't.

**Wesley Donaldson | 38:38**
Like, it's not he can't.

**Sam Hatoum | 38:39**
And we have to just make sure we're really on top of this.

**Wesley Donaldson | 38:39**
And we have to just make sure we're on top of this.

**Sam Hatoum | 38:42**
So to which I said, well, look, I'm not going to answer you straight away.

**Wesley Donaldson | 38:42**
So to which I said, well, look, I'm gonna answer to you straight away.

**Sam Hatoum | 38:45**
I'm going to go do the deep research and come back out and spoke to the guys to show gold and show me the code.

**Wesley Donaldson | 38:46**
I'm going to go do the decreasession come back out and I spoke to the guys that show the showing the code way the problems are understood who did wanted to know who did what and so on.

**Sam Hatoum | 38:50**
I look at where the problems. I understood who did it. I wanted to know who did what. 
And so on, I went back to Stas, I said, look, I found the problems, here's what they are.

**Wesley Donaldson | 38:54**
Going back to space to look and found the problems is what they are.

**Sam Hatoum | 38:57**
I don't think they're insurmountable, you know, I think that, you know, here's a plan that we can fix it.

**Wesley Donaldson | 38:57**
I don't think they're insurmountable. 
You know? I think that, you know, there's a plan that we can fix it.

**Sam Hatoum | 39:02**
Let's let me go do that with the team.

**Wesley Donaldson | 39:02**
Let's let me go through that with the team.

**Sam Hatoum | 39:05**
I'll prep Wesley Antonio like I just did just now.

**Wesley Donaldson | 39:05**
I'll prep cos the Antonio like I just did just now, make sure that we've got executed and come back to you.

**Sam Hatoum | 39:08**
Make sure that we've got it executed and come back to you. So, you know, now I'll go back to him and say, this is now in flight the plant to fix the stuff.

**Wesley Donaldson | 39:10**
So if you now I'll go back to him and say this now in flight to the plan to fix this stuff. And then at some point there, I said to him when we get a deep into the refactoring side.

**Sam Hatoum | 39:16**
And then at some point, though, I said to him, when we get deep into the refactoring side. So like as you, as I mentioned, there's a refactoring of existing systems.

**Wesley Donaldson | 39:20**
So like as you know, as I mentioned, there's a refactoring of existing systems for Curly, I'm not too worried about.

**Sam Hatoum | 39:23**
Rock Curley I'm not too worried about. 
I think Antonio, you'll be able to cover that, but the one about the existing results system that needs some refactoring, I said to him that I'd be happy to lead or to be heavily involved in that, so hopefully that should come naturally.

**Wesley Donaldson | 39:25**
I think Antonio be able to cover that. But the one about the existing results system that needs some refactoring of certain that I'll be happy to leave or to be heavily involved in that. So hopefully that should come and that should be.

**Sam Hatoum | 39:38**
But please just pay extra attention if anyone's ever working on any refactoring recording regarding the storage of events in the first place.

**Wesley Donaldson | 39:38**
But please pay extra attention if anyone's ever working on any factory regarding the storage of events in the first place.

**Sam Hatoum | 39:45**
And you know how we get how we ingest things and how we get things out of Seastar strangulation.

**Wesley Donaldson | 39:45**
And you know how we get how we ingest things and how we get things at sea by translation and need to be heavily involved in that to make sure we succeed.

**Sam Hatoum | 39:49**
I need to be heavily involved in those to make sure we succeed. 
Alright, so that's part.

**Wesley Donaldson | 39:54**
So that's one for you.

**Sam Hatoum | 39:55**
Part one. For a note for you, please pull me in.

**Wesley Donaldson | 39:56**
Please pull me in.

**Sam Hatoum | 39:58**
At the minute the word, refactoring comes in to the event store.

**Wesley Donaldson | 39:58**
The minute the word refractory comes in to the event store.

**Sam Hatoum | 40:03**
At the event store code or code around, you know, storage of results or strangling or any of these terms come up.

**Wesley Donaldson | 40:03**
The event store code or code around, you know, storage of results or strangling. Any of these funds come up.

**Sam Hatoum | 40:09**
I just need to be veryd.

**Wesley Donaldson | 40:09**
I just need to be very involved. 
Okay, that's good. Cla on that, yes.

**Sam Hatoum | 40:14**
Yes. 
So then stays that will keep stays happy because now he'll know that his systems humming and working, which is what we want.

**Wesley Donaldson | 40:15**
So then Stas stays happy because now you'll know that his system is running and working, which is both more.

**Sam Hatoum | 40:21**
And then, yeah, other than that, I mean, Jennifer had asked me to.

**Wesley Donaldson | 40:21**
And then, yeah, other than, I mean, Jennifer had asked me to choose running the teams, I was.

**Sam Hatoum | 40:25**
Choo was running the teams. I was there. 
Like the guys did a great job of doing self organizing.

**Wesley Donaldson | 40:27**
The guys did a great job of doing self organizing.

**Sam Hatoum | 40:29**
I actually think you should be letting them continue this.

**Wesley Donaldson | 40:29**
I actually think you should be letting them continue this.

**Sam Hatoum | 40:32**
Like, seriously, they're doing a fantastic job.

**Wesley Donaldson | 40:32**
Like, seriously. It's a fantastic job, I think.

**Sam Hatoum | 40:34**
I think. Keep circling around.

**Wesley Donaldson | 40:35**
Keep circling around.

**Sam Hatoum | 40:36**
And don't.

**Wesley Donaldson | 40:36**
And don't.

**Sam Hatoum | 40:37**
Don't be the person that runs it and just get back to run it as well.

**Wesley Donaldson | 40:37**
Don't be the person that runs it and just get back to run it as well.

**Sam Hatoum | 40:41**
Like, I think it's gone so well.

**Wesley Donaldson | 40:41**
Like, I think it's gone so well, frankly, it's better than you run it.

**Sam Hatoum | 40:43**
Frankly, it's better than you running it. Not that you're bad at running it.

**Wesley Donaldson | 40:45**
Not that you're bad running it saying that.

**Sam Hatoum | 40:47**
I'm not saying that. It's just more of a it's the collaboration, the level of collaboration that happened between the team just shot up exactly.

**Wesley Donaldson | 40:48**
It's just more of a it's the collaboration the level of collaboration that happened between the team just shot that's great. That's what we're looking for exactly.

**Sam Hatoum | 41:00**
So like be the shepherd of that and I think like, get the practice going.

**Wesley Donaldson | 41:00**
So like be a shepherd of get the practice going.

**Sam Hatoum | 41:03**
Of course you can run every now and again.

**Wesley Donaldson | 41:03**
Of course you can run every now and again.

**Sam Hatoum | 41:05**
I think you can jump in and run with it, but just treat it like that and make it a fun game.

**Wesley Donaldson | 41:05**
I think you can jump in and run with it and just.

**Sam Hatoum | 41:08**
I think that went really well, is what I'm saying.

**Wesley Donaldson | 41:11**
Yeah, I actually wanted to give you some feedback on that. Really impressed with how co handle that. There are a few areas where like, he got a little bit of pushback or contention, and I think he handled them really well. 
So compliments to him on just like not just being an engineer but being like a quasi manager there. So in that note I'm sure you're keeping on him and that to it please.

**Sam Hatoum | 41:31**
Yeah, well, yeah, he had he told me like. 
So, yeah, thank you for that.

**Wesley Donaldson | 41:39**
So yeah, thank you for that.

**Sam Hatoum | 41:40**
Like, it's super useful feedback.

**Wesley Donaldson | 41:40**
It's to useful feedback.

**Sam Hatoum | 41:42**
But, you know, when we were first talking about employment and stuff, and this is before I actually employed you at all.

**Wesley Donaldson | 41:42**
But you know, when we were first talking about employment and stuff and this before actually employed you at all, it seems like I was think I'm looking.

**Sam Hatoum | 41:47**
But he was like. I was like, you know, I'm looking. He came into the team and I said, I'm looking for a, you know, delivery manager.

**Wesley Donaldson | 41:50**
He came into the team and I said, I'm looking for, you know, delivery manager.

**Sam Hatoum | 41:55**
Did anyone know?

**Wesley Donaldson | 41:55**
They don't know anyone.

**Sam Hatoum | 41:56**
Anyone and he said me and I'm like, let me see you in action first man, before we go to that.

**Wesley Donaldson | 41:56**
And he said, maybe. And I'm like, let me see you in action first before we go to that.

**Sam Hatoum | 42:04**
But that, you know, he I think he fancies himself and rightfully so as someone who's got the leader skills and he's probably it's probably a muscle he wants to practice.

**Wesley Donaldson | 42:04**
But that, you know, he. I think he fancied himself in right to himself as someone who's got leader skills and it's probably as to practice so do pushing to do that nice.

**Sam Hatoum | 42:10**
So do definitely push him to do that.

**Wesley Donaldson | 42:12**
Okay, another item for you was I was concerned. There was. That was a second conversation we had last week around missed events. I saw your posts around just as a noise issue. Sounds like Francis is making some tweaks around how events make it into teams. That feels like a concern to me. 
I know we're talking about a few thought more alerts, like critical alerts, getting alarms.

**Sam Hatoum | 42:37**
Yeah. Logs? You mean you're talking about logs, right? Like as in alarms, yeah.

**Wesley Donaldson | 42:43**
Yeah, alarms term.

**Sam Hatoum | 42:45**
E events is a conflated term. Be careful. I got what you meant.

**Wesley Donaldson | 42:48**
I got what you meant. Yeah, my worry there is like I didn't see the write up from the post mortem, but I think good enough people to know what happened during that time. 
And then there are effectively two such events in the past three weeks.

**Sam Hatoum | 43:00**
2.

**Wesley Donaldson | 43:03**
Two weeks, yeah.

**Sam Hatoum | 43:05**
Yeah.

**Wesley Donaldson | 43:05**
And you had a good perspective of, like, a while back when we were talking about observability, we talked about having events come to people rather than having to people go to events. Wanted to just get a perspective. I don't think it's for the architecture meeting, but just keeping it on your radar that's too in like as I said two, three weeks has that been something that stays has flagged is the bigger worry I have is events sorry alerts or alarms that happen and then they get buried or they kind of like no one ever resolves them.

**Sam Hatoum | 43:27**
Hemm, yeah, so I mean, lots of thoughts, but I want to help states do this right, but like we're supposed to get my initial idea was let's get Senty in on Sentry's in.

**Wesley Donaldson | 43:38**
Yes, I mean, lots of thoughts, but I want to help states do it this way. 
But like we're supposed to get. My initial idea was let's get Century in on TUR let's get all the loads through, keep them on and plugging everyone by default, and we start to deal with them one by one.

**Sam Hatoum | 43:48**
Let's get all the logs, all the alerts that keep them on and bugging everyone by default, and we start to deal with them one by one. 
And that's about like.

**Wesley Donaldson | 43:55**
And that's I've mentioned that recently again on the conversation in the pieces we saw it but said in response is that we got a name of maximum norms first and then selectively remove the word deliberately remove the noise, not have it that all noise was off.

**Sam Hatoum | 43:56**
I've mentioned that previously recently again on the conversation in the themes that you saw it where I said to in response, which is look, we've got to enable maximum noise first and then selectively remove like what's the word, deliberately remove the noise, not it that all noise is off. 
And then we're like, hey, we didn't see this, hey, we didn't see this.

**Wesley Donaldson | 44:16**
And they were like, hey, we didn't see this, hey, we didn't see this.

**Sam Hatoum | 44:19**
It should be the opposite.

**Wesley Donaldson | 44:19**
Should be your positions, should be that we saw everything but fuck's noisy.

**Sam Hatoum | 44:20**
It should be that we saw everything, but fuck, it's noisy, so let's clean the noise out.

**Wesley Donaldson | 44:24**
So let's see the noise.

**Sam Hatoum | 44:26**
That's the way to fix it, right?

**Wesley Donaldson | 44:26**
That's the way to face it.

**Sam Hatoum | 44:31**
And so, like, you know, we need to just, like.

**Wesley Donaldson | 44:31**
And so like we need to just like.

**Sam Hatoum | 44:34**
And the noise should really be coming to people, specific people.

**Wesley Donaldson | 44:35**
And the noise should really be coming to people, specific people.

**Sam Hatoum | 44:38**
Like, we have a job around going to look at the most recent noise every day.

**Wesley Donaldson | 44:38**
Like we have a job around going to look at the most recent noise every day.

**Sam Hatoum | 44:42**
Like we should have a rotation where, you know, all the noise is coming through and every day somebody goes in there and looks at the noise.

**Wesley Donaldson | 44:43**
We should have a rotation where, you know, all the noise is coming through and every day somebody goes in there and looks at the noise, find signal and finds ways to remove noise effectively.

**Sam Hatoum | 44:52**
Find signal and finds ways to remove noise effectively. 
And if we do that eventually, we'll only we'll get clean signal coming through the noise.

**Wesley Donaldson | 44:56**
And if we do that, eventually we'll get clean signal coming toals.

**Sam Hatoum | 45:00**
But right now we're getting we're trying to we're not getting any noise and we're trying to just identify signal.

**Wesley Donaldson | 45:00**
But right now we're getting we're trying to we're not getting any noise, but we're trying to just identify signal.

**Sam Hatoum | 45:07**
And I'm saying that's the inverse.

**Wesley Donaldson | 45:07**
And I'm saying that's the inverse.

**Sam Hatoum | 45:09**
We should.

**Wesley Donaldson | 45:09**
We should.

**Sam Hatoum | 45:09**
Is what we should do.

**Wesley Donaldson | 45:10**
Is what we should do, I think. 
So you want to put a practice around that.

**Sam Hatoum | 45:15**
So I was just saying, if you want to put a practice around that, that's what I would do.

**Wesley Donaldson | 45:20**
That's what I would do would say like let's first of all, step one enable, you know, tune up noise to the maps.

**Sam Hatoum | 45:20**
I would say, like, let's first of all, step one, enable, you know, tune up noise to the max. Step two have a group of people that they're going to go in and they're gonna, you know, selectively mute SLA deal with the noise so that we end up with a signal having on rotation one hour a day.

**Wesley Donaldson | 45:26**
Step to have a group of people that they're gonna go in and they're gonna, you know, selectively mute flash deal the noise so that we end up with a signal having on a rotation one hour a day.

**Sam Hatoum | 45:38**
Different developer goes in to do it, including Jennifer, including this, the new guy, like just everybody is on this, like duty, right?

**Wesley Donaldson | 45:38**
Different developer goes into to do it, including Jennifer, including this the new guy like just everybody is on this like duty, right?

**Sam Hatoum | 45:48**
And they just have it like.

**Wesley Donaldson | 45:48**
And these habits like who's on alert duty today?

**Sam Hatoum | 45:49**
Who's on alert duty today? Go and have a look, please and tell us what you found.

**Wesley Donaldson | 45:51**
Go and have a lookt tell us what you found. Yeah.

**Sam Hatoum | 45:53**
Then it becomes an active problem to the team.

**Wesley Donaldson | 45:53**
Then it becomes an active problem. I like that. I like that a lot. Centuries kind of there, I think we're the obvious we de prioritize it for the commerce stuff. 
But we'll get to a good place on commerce by the end of this week. So we can restart that initiative as well.

**Sam Hatoum | 46:11**
Are the dates that they're putting on.

**Wesley Donaldson | 46:11**
On the dates that they're putting on and then an outlet being estimate in the first place.

**Sam Hatoum | 46:13**
I don't know how they're being estimated in the first place, but, like, how well are we tracking to those dates and how much will we off those dates?

**Wesley Donaldson | 46:15**
But like how well are we tracking those states and how much will we offer? We're tracking really well actually. We. And how are we putting the dates in? That's part of my engineering refinement. So that basically is just the team gets together. I usually put a date like, hey, I think this can be done based on our password on this date. Who disagrees? Why do you disagree? Propose an alternative date to just give a rationale, and that's usually how we generate the dates, right?

**Sam Hatoum | 46:43**
Okay, great.

**Wesley Donaldson | 46:45**
Great.

**Sam Hatoum | 46:45**
So, anything else you want to say about this subject?

**Wesley Donaldson | 46:45**
So anything else about the NE yet? I think that's it.

**Sam Hatoum | 46:52**
Okay, so. So the other thing I spoke to Stace about is I've got Fernando, though.

**Wesley Donaldson | 46:54**
So the other thing I spoke to Stace about is I've got Fernando, which came off of Revenum.

**Sam Hatoum | 46:58**
That just came off of a little bit of revenue I've got and working some ADT potentially another gig right now, but.

**Wesley Donaldson | 47:04**
I'm going to work in some a int potentially eg right now, but I've got Eagle coming up as well.

**Sam Hatoum | 47:08**
And I've got ego coming off as well. So anyway, I told Stas I got some superstars coming off another project and end of March I he's got some budget to add a person so just want to keep track of that.

**Wesley Donaldson | 47:09**
So I told Stas there about some superstars coming up on the project and end of March. I think he's got some budget to add a present. So just want to keep track of that.

**Sam Hatoum | 47:19**
But like, you know, we've got to show results.

**Wesley Donaldson | 47:19**
But like, you know, we've got to show results like in order for us to do that, we're really showing results here.

**Sam Hatoum | 47:20**
Like in order for us to do that, we've got to really be showing results here. Like we've got to.

**Wesley Donaldson | 47:24**
We're going to.

**Sam Hatoum | 47:24**
And that's why I'm asking about these dates.

**Wesley Donaldson | 47:24**
And that's why I'm asking about these days.

**Sam Hatoum | 47:26**
If at the end of it, he goes back to his board and he says, look, we put it this is what he wanted.

**Wesley Donaldson | 47:26**
But at the end of it, he goes back to his board and he says, look, this is what we wanted.

**Sam Hatoum | 47:30**
He wants like the reason.

**Wesley Donaldson | 47:30**
He wants to gen all these dates and he's trying to do everything court it.

**Sam Hatoum | 47:31**
He's got all these dates and he's trying to do everything this quarter. He wants to go back to his board and say, you see, like all these things that we added into the system, like all this extra stuff that we added, all this investment we made last year in all these months I took off, look how fast we can deliver that.

**Wesley Donaldson | 47:33**
He wants to go back to his ball and say it seemed like all these things that we added into the system, like all this extra stuff that we had, all this investment we made last year and one month I took up like how fast we can deliver in. 
But that's what he's really looking for.

**Sam Hatoum | 47:43**
That's what he's really looking for. And so you know, if we give him that, then he's going to reward us handsomely, which, you know, the more we get rewarded, then obviously, the more bonus for everybody for us as well.

**Wesley Donaldson | 47:46**
And so you know, if you given that, then he's going to reward us handsome. Those which the more we get rewarded then obviously the more bonus everybody for us as well the company end the year.

**Sam Hatoum | 47:55**
The company at the end of the year. 
So yeah, that's that would be.

**Wesley Donaldson | 47:57**
So yeah, that's that will be.

**Sam Hatoum | 48:00**
Let's keep up the good work there.

**Wesley Donaldson | 48:00**
Let's keep up the good work there.

**Sam Hatoum | 48:02**
And just bear in mind that, you know, I'm going to try and bring in some extra help.

**Wesley Donaldson | 48:02**
And just bear in mind that, you know, I'm going to try and bring some extra help.

**Sam Hatoum | 48:06**
And actually one of the things you could do is I like doing this like you can kind of say, especially if it's just in conversation with states and the group like not don't stay in front of the developers ever.

**Wesley Donaldson | 48:06**
And actually, one of the things you can do is. I like doing this. 
Like you can kind of say, especially if it's just in conversation with states and the group like not don't say in front of the developers, never be careful, never in front of the dot but in the sessions we have like with just an initial it's like, hey, you know, Sam, I know Sam mentioned to you that this person.

**Sam Hatoum | 48:17**
Be careful, never in front of the devs, but in the sessions we have, like, with just the leaderships, like, you know, Sam. 
I know Sam mentioned to you that this person. Yeah, I know.

**Wesley Donaldson | 48:26**
Be honest, let's say there's a piece of work to do for like next quarter and then you could just mention it in passing as if it's reality, but it would be something along the lines of Santo you guys have been chatting about XYZ.

**Sam Hatoum | 48:27**
Like, let's say there's a piece of work to do for, like, next quarter. And then you could just mention it in passing as if it's reality. Like it would be something along the lines of. Sam told me you guys, have been chatting about XYZ. 
If that's the case, this is something we could potentially give to the new person.

**Wesley Donaldson | 48:39**
If that's the case, this is something we could potentially be for you us.

**Sam Hatoum | 48:42**
Like, you know what I mean, but just exactly.

**Wesley Donaldson | 48:45**
You hint at it enough, it becomes real.

**Sam Hatoum | 48:48**
Exactly, but just be careful with how it's done, because states can get very sensitive to things leaking out in front of the wrong people.

**Wesley Donaldson | 48:48**
Exactly. Just be careful with how it's done, because they can get very sensitive to things. Meaking out in front of the wrong people. 
Totally understand.

**Sam Hatoum | 48:58**
Yeah, okay, similar with Ruben.

**Wesley Donaldson | 48:59**
That is all I had. With Ruben, with Jeff, I mean you.

**Sam Hatoum | 49:04**
With Jeff. I mean, like, you know, tomorrow, hopefully, I'm gonna go meet Florid if I can.

**Wesley Donaldson | 49:05**
Of tomorrow, hopefully. I'm gonna go meet Gloria if I can.

**Sam Hatoum | 49:08**
I'm gonna ping him out.

**Wesley Donaldson | 49:08**
I'm opinion now, but I'm trying to get one more person into that gig so we can go wild on this.

**Sam Hatoum | 49:09**
But I'm trying to get one more person into that gig so we can go wild on this delivery of this overall thing.

**Wesley Donaldson | 49:14**
He agree with this overall thing, but man, it is toxic over there.

**Sam Hatoum | 49:17**
But, man, it is toxic over there.

**Wesley Donaldson | 49:18**
And like Jeffrey doesn't do himself or anyone else any favor, like he's so he's gotten more and more toxic.

**Sam Hatoum | 49:18**
Like, Jeff really doesn't do himself or anyone else any favors. Like he's. So he's gotten more and more toxic. 
Like, he was difficult at AK, he became more difficult at 2K, and now he's the most difficult I've ever seen.

**Wesley Donaldson | 49:25**
He was difficult at AQA, he became more difficult at 2K, and now he's the most difficult of ever. See, in what way?

**Sam Hatoum | 49:35**
So, I mean, just doesn't let people breathe, you know, like, he just comes down on AA like a ton of bread.

**Wesley Donaldson | 49:37**
I mean, it just doesn't let people breathe, you know? Like he just comes down on AA like a ton of Brit.

**Sam Hatoum | 49:44**
He's always got to have, you know, the like he's always going to have conflict.

**Wesley Donaldson | 49:44**
He's always got to have, you know, that like he's always going to have conflict.

**Sam Hatoum | 49:48**
He's.

**Wesley Donaldson | 49:48**
He's.

**Sam Hatoum | 49:48**
He's the kind of person that has to have an antagonist in his life that he has to beat down.

**Wesley Donaldson | 49:48**
He's the kind of person that has to have an antagonist in his life. That he has the big devil, you know?

**Sam Hatoum | 49:53**
You know? Like, it's just there's a.

**Wesley Donaldson | 49:53**
Like, it's just there's a.

**Sam Hatoum | 49:55**
There's AI don't know, we probably look too much into the shit, but there's some kind of, like, childhood drama going on here.

**Wesley Donaldson | 49:55**
There's AI don't know, I'm probably too much into the shit, but there's some kind of, like, childhood drama, you know, like with having somebody.

**Sam Hatoum | 50:04**
Like with having somebody. You always have to, like, be having.

**Wesley Donaldson | 50:07**
You always have to like be having always having to have an enemy that you can.

**Sam Hatoum | 50:09**
Always having to have an enemy that you can have a fight with. 
You know, you get trained into that sometimes.

**Wesley Donaldson | 50:15**
I think I've told my wife that, sorry, my question is geared towards do you sense do you perceive that in his tasking of Florian and Ruben, do you perceive cause like I don't have much exposure to how he interacts with Anya or I don't know what the hell Anya is even doing.

**Sam Hatoum | 50:16**
A bit of psychoanalysis, but.

**Wesley Donaldson | 50:37**
Could you. Can you say a little bit more?

**Sam Hatoum | 50:37**
Exactly. I mean, yeah, it's.

**Wesley Donaldson | 50:38**
As the source of that. 
Yeah, it's, you know, I said to him, let's give our team over to Anya and et cetera.

**Sam Hatoum | 50:41**
You know, I'd said to him, let's give our team over to Anya and et cetera. And then, you know, he tried, but then she didn't, which is kind of her problem.

**Wesley Donaldson | 50:44**
And, you know, he tried, but then she didn't, which is a problem.

**Sam Hatoum | 50:50**
But then like it's just the amount of shit talking that happens.

**Wesley Donaldson | 50:50**
But then they it's just the amount of shit talking that happens.

**Sam Hatoum | 50:53**
Recently, somewhat internally, I think it was Lucas that, like, left.

**Wesley Donaldson | 50:53**
Recently, somewhat internally, I think it was Lucas that like left like this is too toxic.

**Sam Hatoum | 50:57**
He's like, this is too toxic. 
And he's had already a couple of HR complaints about it internally.

**Wesley Donaldson | 50:59**
And he's had already a couple of a child complaints about it.

**Sam Hatoum | 51:04**
Yeah.

**Wesley Donaldson | 51:04**
Yeah, and previously his 2K he was given HR for commands.

**Sam Hatoum | 51:05**
And previously, you know, his two K he was given HR refrimands from them and.

**Wesley Donaldson | 51:10**
And from that sounds like. A need for a good friend who's known him for decades, plus to have an assign with him.

**Sam Hatoum | 51:14**
Yeah, what's that?

**Wesley Donaldson | 51:21**
That sounds like an opportunity for a friend who's known him for a decade, plus to have an as with him.

**Sam Hatoum | 51:27**
Well, I yeah, I mean, I do sometimes I do talk about it, but, like, there's a very touchy subject for him, like, very, you know, he can get very nuclear around it very quickly because, you know, it's.

**Wesley Donaldson | 51:27**
Well, yeah, I mean, I do talk about it, but, like, it's a very touchy subject for very. You know, you can get very nuclear around it very quickly because, you know, it's.

**Sam Hatoum | 51:38**
It's one of those if you're not with me or against me kind of thing on list issues.

**Wesley Donaldson | 51:38**
It's one of those if you're not with me kind of thing on these issues. You have to be open minded to take that kind of feedback.

**Sam Hatoum | 51:44**
So it's that kind of is that kind of, like sensitivity around them.

**Wesley Donaldson | 51:47**
Is that kind of like sensitivity around and nego shit like, you know, be careful.

**Sam Hatoum | 51:52**
I'm like, shit. Like, you know, be careful what you want to sort out and fix it.

**Wesley Donaldson | 51:55**
What you want to sort out and fix it? 
I've been on the receiving end of it in the past.

**Sam Hatoum | 51:57**
I've been on the receiving end of it in the past, honestly.

**Wesley Donaldson | 52:02**
I mean, I perceive him being happy with the work.

**Sam Hatoum | 52:03**
So anyway, all right, so yeah, I mean, he's very happy with it, he's definitely very happy with the team, and like, I think he's brewing what we're doing.

**Wesley Donaldson | 52:05**
So that's the most important thing. I mean, he's very happy with it. And, like, I think he's brewing what we're doing.

**Sam Hatoum | 52:13**
The other thing is, like, I'll tell you what, there's a.

**Wesley Donaldson | 52:13**
The other thing he's like, I'll tell you is that he has a lot of, like, what's the word?

**Sam Hatoum | 52:15**
He has a lot of, like, what's the word? Ambition when it comes to certain things.

**Wesley Donaldson | 52:18**
Ambition when it comes to things like.

**Sam Hatoum | 52:21**
Like, again, I'll just tell you this so the it doesn't come to you as a surprise when it will happen.

**Wesley Donaldson | 52:21**
Again, I'll just tell you this so that doesn't come to as a surprise when it will happen.

**Sam Hatoum | 52:25**
By the way, let me know if it cuts out.

**Wesley Donaldson | 52:25**
But if it cuts out.

**Sam Hatoum | 52:27**
I'm about to go through some woods.

**Wesley Donaldson | 52:27**
I'm about to go through some woods.

**Sam Hatoum | 52:28**
But, what?

**Wesley Donaldson | 52:28**
But what I so akka.

**Sam Hatoum | 52:30**
I've so. Akka. I went in.

**Wesley Donaldson | 52:33**
I went in.

**Sam Hatoum | 52:34**
I built all their pipelines.

**Wesley Donaldson | 52:34**
I built all their pipelines.

**Sam Hatoum | 52:36**
The PO system was falling apart and I came in Audi and like, I helped build the systems like the pipelines.

**Wesley Donaldson | 52:36**
The whole systems kept falling apart and I gave in to Audi and like I helped build the systems like the pipelines.

**Sam Hatoum | 52:41**
I put a, you know, a squad together and we like, just fixed everything.

**Wesley Donaldson | 52:42**
I put it a squad together. We just fixed everything then like how we didn't less and then it just worked right and then all were happy and then they were delivering and applying.

**Sam Hatoum | 52:45**
Bit like how we didn't do that on this. 
And then it just worked right? And then everyone was happy and then they were delivering and deploying. And when it came to, like, the internal AKQA awards or whatever, he didn't give me and my team a single mention.

**Wesley Donaldson | 52:52**
And when it came to, like, the internal APQA awards or whatever, he didn't give me and my team a single mention except in Jeff.

**Sam Hatoum | 52:59**
I said to him, Jeff, you've done a great job of, like, making all this work.

**Wesley Donaldson | 53:00**
We've done a great job of like, making all this work.

**Sam Hatoum | 53:02**
He's like, yeah, thank you.

**Wesley Donaldson | 53:02**
He's like, yeah, thank you.

**Sam Hatoum | 53:03**
It's really hard work and didn't give a single mention to me and the team that actually done all this work.

**Wesley Donaldson | 53:03**
It's really hard work and didn't give a single mention to me and the team that actually does this work.

**Sam Hatoum | 53:07**
And then I saw the same thing again at AK 2K.

**Wesley Donaldson | 53:07**
And then I saw the same thing again in 2K like we'll build on something in three months in fucking record time.

**Sam Hatoum | 53:10**
Like we're build on something in three months in fucking record time. 
And again didn't mention Zovia one second.

**Wesley Donaldson | 53:13**
And again. Didn't mention Zoho. One second.

**Sam Hatoum | 53:15**
So, you know, what I feel is happening here is like, he sees that there's an opportunity here for him to look great with what we just built with this vibe coded like platform and everything, and he's going to go and show it to the leadership and say, like, you know, look what I did.

**Wesley Donaldson | 53:15**
So, you know, what I feel is happening here is like he sees that there's an opportunity here for him to sort of grade with what we just built with this by code in the platform and everything, and he's going to go and show it to the leadership and say, like, look what I did.

**Sam Hatoum | 53:29**
And that's why he's not giving anything to Anya.

**Wesley Donaldson | 53:29**
And that's why he's not giving anything to AA.

**Sam Hatoum | 53:31**
I think first he was going to, but then he realized, shit, this is something I can own.

**Wesley Donaldson | 53:31**
I think first he was going to, but then he realized, shit, this is something I can own.

**Sam Hatoum | 53:35**
So he's like, protecting it like crazy until it becomes something tangible and valuable.

**Wesley Donaldson | 53:35**
So he's like, protecting it like crazy until it becomes something tangible and valuable.

**Sam Hatoum | 53:39**
And then he's going to go over to the board and say, look, you wouldn't have this shit without me.

**Wesley Donaldson | 53:39**
And then he's going to go over to the board and say, look, you wouldn't have to ship that money. Yeah, you could do that without with and still spread the love like. Yeah.

**Sam Hatoum | 53:51**
I know, but I'm just letting you know, like that's to be expected.

**Wesley Donaldson | 53:51**
I know. I'm just saying, you know, that's. 
That's to be expected.

**Sam Hatoum | 53:54**
Okay?

**Wesley Donaldson | 53:54**
This just.

**Sam Hatoum | 53:54**
So just we I'll prep the team on.

**Wesley Donaldson | 53:56**
I'll pre the team on that just because it can feel shity.

**Sam Hatoum | 53:57**
But just because it can feel shitty, you know, like when you're sitting there and you're listening to all the awards and whatever and behind the an accolades and you're like, wait a minute, I did those part of about.

**Wesley Donaldson | 53:59**
You know, like when you're sitting there and you're listening all the awards and whatever behind the an accolades and you're like, wait a minute. 
I mean, that part, yeah.

**Sam Hatoum | 54:09**
Well, no, not certain.

**Wesley Donaldson | 54:09**
I have never once taken credit alone for anything I've ever done. It's just.

**Sam Hatoum | 54:15**
I know.

**Wesley Donaldson | 54:15**
It's just not real. Like, you didn't write it all, and even if you did write it all, you had people around you supporting you.

**Sam Hatoum | 54:23**
So just things to be expected, but yeah, that's what I think is going on politically.

**Wesley Donaldson | 54:24**
Just things to be expected. 
But yeah, that's what I think is going on politically.

**Sam Hatoum | 54:28**
But yeah, I mean, I asked them about getting an extra person.

**Wesley Donaldson | 54:28**
But yeah, I mean, I asked them about getting an extra person.

**Sam Hatoum | 54:30**
I don't know if we'll going to get that just yet.

**Wesley Donaldson | 54:30**
I don't know if we're going to get that. Just again, we have to show some real promise.

**Sam Hatoum | 54:32**
We have to show some real promise. 
So again, we have to get this stuff working in terms of like, scheduling real jobs.

**Wesley Donaldson | 54:34**
So again, we have to get this stuff working with terms of like scheduling real jobs.

**Sam Hatoum | 54:39**
If we can show things like look, this team was able to do what that other team did, you know, with the AI workflows.

**Wesley Donaldson | 54:39**
If we can show things like look, this he was able to do what other team did, you know, with the AI workflows.

**Sam Hatoum | 54:48**
If we can show that our pipeline can handle that, and we did it in a couple of weeks.

**Wesley Donaldson | 54:48**
If we can show that our five nine can handle that and we make up the weeks, well, that's going to be like what the fuck we do?

**Sam Hatoum | 54:52**
Well, that's going to be like what the fuck we're doing, right? And I think you'll just speak volumes to our capability and our power.

**Wesley Donaldson | 54:55**
And I think it'll just speed volumes into our capability and out.

**Sam Hatoum | 54:59**
And then Jeff will have more budget and money to push this way.

**Wesley Donaldson | 54:59**
And then, Jeff, we'll have more budget and money to push this way.

**Sam Hatoum | 55:03**
But what you wouldn't.

**Wesley Donaldson | 55:03**
But what he wouldn't do is say like here just tell you why he does this, I believe is that if he feels that if he just saysz you did this I want what do we need you how?

**Sam Hatoum | 55:04**
What you wouldn't do, say, like, you know, just tell you why he does this, I believe, is that if he feels that if he just says, Zovia did this, they'll be like, well, what the fuck do we need you? 
So that's probably why he's so protective over it.

**Wesley Donaldson | 55:19**
The last conversation I was in with Ruben, I sensed a little bit of you walking on my turf has like.

**Sam Hatoum | 55:26**
Yes.

**Wesley Donaldson | 55:27**
And then I saw your comment to. And then my brain basically went to. Okay, fine. He basically put down the hammer of, like, you don't understand what I'm doing. I own this. Can you anything from Ruben, specifically from the calling out to apologize?

**Sam Hatoum | 55:41**
I mean, aside from that, he called me up to apologize and said, I don't know what's going on.

**Wesley Donaldson | 55:44**
I said, I don't know what's going on, I think.

**Sam Hatoum | 55:45**
I think. I honestly think it's just like envy rearing, it's fucking ugly head.

**Wesley Donaldson | 55:46**
I honestly think it's just like Envy reads looking over your head.

**Sam Hatoum | 55:49**
I really think it's that.

**Wesley Donaldson | 55:49**
I really think it's that.

**Sam Hatoum | 55:52**
Like.

**Wesley Donaldson | 55:52**
Like, I think he feels that he's the most intelligent, the most.

**Sam Hatoum | 55:54**
I think he feels that he's the most intelligent. The he his self image is that he's the most intelligent, most resourceful, most blah.

**Wesley Donaldson | 55:57**
His self image is that he's the most intelligent, most resourceful, most blah.

**Sam Hatoum | 56:03**
And, you know, here we come along with something that just looks insane.

**Wesley Donaldson | 56:03**
And, you know, here we come along with something that just looks insane.

**Sam Hatoum | 56:08**
All right? And, you know, it's wowing a lot of people more than anything he's doing right now.

**Wesley Donaldson | 56:09**
And, you know, it's wowing a lot of people more than anything he's doing right now.

**Sam Hatoum | 56:15**
And he feels that he has what he's got is more wow awe inspiring than anything we're doing.

**Wesley Donaldson | 56:15**
And he feels that he has what he's got is more wow, more inspiring than anything we're doing.

**Sam Hatoum | 56:23**
You know, like comments like, Sam, do you understand what this is like?

**Wesley Donaldson | 56:23**
You know, like comments like. Sam, do you understand what this is?

**Sam Hatoum | 56:28**
No, it's like what is very basic data science stuff like.

**Wesley Donaldson | 56:28**
Like, well, it's very Basic design stuff.

**Sam Hatoum | 56:31**
Okay, Tom, what it is, right? I'm, like, just basically playing too it.

**Wesley Donaldson | 56:34**
You should have been a professor instead of a technologist.

**Sam Hatoum | 56:39**
What's that?

**Wesley Donaldson | 56:39**
Was that maybe he should have been a professor like Rover and like, we need you on this team.

**Sam Hatoum | 56:40**
Yeah, exactly. So I was like, and I said to him, like, Ruben, and like, we need you on this steam. And like, I'm like, look, I don't understand any of the data science, you know, I don't understand any of the quantum stuff.

**Wesley Donaldson | 56:44**
And I'm like, I don't understand any of the data science, you know? I don't understand any of the points of stuff you I know infrastructure, I know you know outputs, I know UX, and I know how to build stuff.

**Sam Hatoum | 56:48**
You know, I know infrastructure, I know, you know input outputs. I know UX and I know how to build stuff. Like that's my forte and like that's what we're here to do, but like, we need a team, we need a whole team of everyone to do that.

**Wesley Donaldson | 56:53**
Like that's my fault and that's what we're here to do. But like we need a team. We got a whole team of every wants to do that.

**Sam Hatoum | 56:58**
So that's why I'm trying to bring him in more.

**Wesley Donaldson | 56:58**
So that's why I'm trying to bringing in more.

**Sam Hatoum | 57:00**
And I think he's got a lot to offer.

**Wesley Donaldson | 57:00**
And I think he's got a lot to offer, but I think he's very immature emotionally.

**Sam Hatoum | 57:02**
But I think he's very immature emotionally. He's got, you know, zero emotional intelligence.

**Wesley Donaldson | 57:04**
He's got, you know, zero emotional intelligence.

**Sam Hatoum | 57:06**
Obviously, when he comes out and says things like that, he's out of control with his own emotions.

**Wesley Donaldson | 57:06**
Obviously, when he comes out and says things like that, he's. He's out of control with his own emotions.

**Sam Hatoum | 57:12**
So, you know, we can either, like, point fingers at him or we can just, like, try and bring him into the fold, but he's just a very large child, you know?

**Wesley Donaldson | 57:12**
So, you know, we can either, like, point fingers at them or we can, like, try and bring them into the fold. But it's just a very large child, right?

**Sam Hatoum | 57:19**
That's the problem.

**Wesley Donaldson | 57:24**
Thank you, that's clear. I will the meeting I had set up two instances of that recurring meeting. I asked Nicholas this morning if he had if they met, this last Wednesday when I was out. 
I think Nicholas maybe conflated that with the demo call. Do you know if the team had a chance to meet with the with Florian and Rub? Yes, last week Wednesday. I think it's Wednesday, pretty sure it's Wednesday. 
I don't know, this is enough.

**Sam Hatoum | 57:56**
It's enough. I've actually got to go.

**Wesley Donaldson | 57:57**
I've actually got to go to a meeting.

**Sam Hatoum | 57:57**
I've got a meeting right now with the with somebody I've got to dash to, but.

**Wesley Donaldson | 57:58**
Right, thank you so much.

**Sam Hatoum | 58:00**
All right, we'll follow up on that. 
If you can phrase that question better in a message, I'll try and answer it. Okay.

**Wesley Donaldson | 58:05**
Yeah, I'll get my own answer. Don't worry about it.

**Sam Hatoum | 58:07**
All right.

**Wesley Donaldson | 58:08**
Thank you.

**Sam Hatoum | 58:08**
Thanks. Ma'am. Jas.

