# TerraQuantum: Architecture Review & Planning - Mar, 12

# Transcript
**Wesley Donaldson | 00:04**
Afternoon.

**Sam Hatoum | 00:07**
Was how?

**Wesley Donaldson | 00:08**
Good. We did get two acceptances for this, so we should have Jeff and Brian here.

**Sam Hatoum | 00:12**
Okay, maybe they'll be... Well, look, I'm just fitting together some car seats, so hold.

**Wesley Donaldson | 00:15**
Car seats. So hold the line for this.

**Sam Hatoum | 00:16**
Hold the line for me, please. I'll be there soon.

**Wesley Donaldson | 00:48**
PM unless they change their mind. Let's see. No.
I always ran the same meeting.
I can message him.
The stress of it is for me.

**Jeff | 02:58**
What's up? Hey, what's going on?

**Wesley Donaldson | 03:03**
Not much.

**Jeff | 03:04**
Sorry about being late.

**Wesley Donaldson | 03:05**
You're all good. Actually, Sammy's maybe two or three minutes, just taking care of a real-life problem.

**Jeff | 03:10**
Okay, that sounds good. I'll put on another cup of coffee here.

**Wesley Donaldson | 03:17**
That's a good idea. I love some coffee.
I'll take mine with extra sugar, please. I like it sweet, thanks.

**Jeff | 03:23**
Damn, that's not good for you, man.

**Wesley Donaldson | 03:24**
Yeah, the wife jokes, she's like, "Dude, do you need to put sugar in your hot chocolate because it tastes better with sugar?"

**Jeff | 03:33**
You really... I like the least amount possible.

**Wesley Donaldson | 03:34**
I will certainly do.

**Jeff | 03:38**
I like black coffee, you know, raw chocolate. I mean, I'm, you know, I like my chocolate.

**Wesley Donaldson | 03:43**
So you're a black chocolate person, right?

**Jeff | 03:46**
Yeah, I mean, Sammy gave me a 100% bar, this awesome Colombian chocolate, and it was fucking delicious, man.

**Wesley Donaldson | 03:46**
Yeah.

**Jeff | 03:54**
But everybody else tastes like... How do you eat that?

**Wesley Donaldson | 03:55**
Everybody else tastes like... How you eat. That tastes like dirt. Having tried dirt, it is probably not that bad, but yeah, same thing.

**Jeff | 03:58**
It tastes like dirt. It's like it's just the way it is.

**Wesley Donaldson | 04:06**
It's probably going to be very bitter. No, it is there.

**Jeff | 04:09**
But that's what I like about it. I like that bitter. The best part is when it's bitter and it has this aftertaste that evens out.

**Wesley Donaldson | 04:12**
And the best part is, as that evens out if you embrace the bitter, then the bidder sort of like I suspect it's one of those acquired tastes.

**Jeff | 04:18**
If you embrace the bitter, when the bitter sort of like flattens out, you're left with this awesome taste.

**Wesley Donaldson | 04:30**
Like, I'm probably the only person in my house that drinks malt and I absolutely love it, and no one can understand why I drink that you bring question or anything like that.

**Jeff | 04:31**
Yeah. Well, I mean, the same thing with, like, the feel like. People were like, how do we drink that shit?
You know, or anything like that, even when you first drink coffee, you know, why do people drink this and then put sugar and milk in there and it's like, this is great.

**Wesley Donaldson | 04:46**
Even when you first get coffee, you know why people drink this and then you putt sugar remote.

**Jeff | 04:53**
Like you're actually not drinking coffee.

**Wesley Donaldson | 04:54**
What are you really drinking?

**Jeff | 04:55**
You're just drinking the sugar.

**Wesley Donaldson | 04:55**
At that point? You're like, "You're just drinking milk, my friend."

**Jeff | 04:59**
YP. Milk? Cer?

**Sam Hatoum | 05:02**
Yeah.

**Wesley Donaldson | 05:04**
Well, we give Sam a couple of minutes. Like, I'd love to share the initial PV from just the chat that we're having internally and the call this morning.

**Sam Hatoum | 05:23**
Putting your car seat together. I'll be right there.

**Wesley Donaldson | 05:27**
There you go in real life. Yeah. So the team is like a lot of conversation. But I think one of the things that they took away from it was...
Yeah, I love the idea of having the scientists be more close to the work and help us. We can own the innovation, we can own the orchestration of the application, the UI, blah.
But love the idea that we get a direct partnership from specifically... Here's how we prove out the math. Here's how we make this concrete. So we took that. We took away a lot of positivity from that, I'm sure.
If you have different thoughts, we're welcome to hear those, but the team is very excited about the idea of a partner. So a question for me is... I'd love to get specific names like some of those folks. I missed the first part of the meeting, so I don't have full clarity on their roles, titles, and names, but if you can do that, maybe send it to me in Slack or if I could just put it from the meeting invite.

**Jeff | 06:25**
Yeah, actually, I'll be doing an introduction soon enough.

**Wesley Donaldson | 06:29**
Okay, then I'll just wait then.

**Jeff | 06:31**
It's...

**Wesley Donaldson | 06:31**
It's...

**Jeff | 06:33**
Yeah, it's actually quite interesting, you know, trying to get these guys involved.

**Wesley Donaldson | 06:34**
It's. It's actually. Quite interesting, you know, trying to get this guy involved.

**Jeff | 06:42**
I needed official permission from their bosses that they could dedicate...

**Wesley Donaldson | 06:42**
I needed official permission from their bosses to pay the dedicated.

**Jeff | 06:46**
And you know, once I got that, I think the best part now is going to be, you know, getting them to be involved and trying to, like, see how much they're willing to take part in a really kinetic software development effort as opposed to what they're used to, which is just straight research.

**Wesley Donaldson | 06:47**
Once I got that, I think the best part now is going to be getting them to be involved and trying to see how much they're willing to take part in a really kinetic software development effort as opposed to what they're used to, which is just straight research.

**Jeff | 07:14**
So it'll be interesting.

**Wesley Donaldson | 07:14**
It'll be interesting.

**Jeff | 07:14**
Sometimes that works well.

**Wesley Donaldson | 07:14**
Sometimes that works well and sometimes not.

**Jeff | 07:15**
And sometimes not.

**Wesley Donaldson | 07:16**
I know that.

**Jeff | 07:16**
I know that. Like Slava, who was out last week, and I think he's still out for his wedding.

**Wesley Donaldson | 07:17**
Like Slava, who was out last week, and I think he's still out for his wedding.

**Jeff | 07:23**
He's an extremely astute scientist who knows a level of detail on this that challenges Florian.

**Wesley Donaldson | 07:23**
He is an extremely astute scientist who knows a level of detail on this that challenges Florian, like back flooring up onto his heels, just trying to answer this guy's questions.

**Jeff | 07:34**
Back flooring Florian up onto his heels, just trying to answer this guy's questions. So he is the right guy.

**Wesley Donaldson | 07:38**
So he is the right guy.

**Jeff | 07:39**
He's a super duper expert.

**Wesley Donaldson | 07:39**
He's a super deep expert.

**Jeff | 07:41**
Then Sasha is... He's based in Canada, actually, and out of Montreal.

**Wesley Donaldson | 07:41**
And then Sasha is he basicallys Canada actually and in Montreal.

**Jeff | 07:49**
And he is more someone who is aligned with kind of like setting things up and the industry sort of standard on the math for getting things prepped and ready to run on a quantum computer.

**Wesley Donaldson | 07:49**
He is more someone who is aligned with setting things up at the industry standard on the math for getting things wrapped and ready to run on a quantum computer.
So bring these two together as one who's deep in the theoretical side and another who's a little bit more on the practical side, but still has that knowledge.

**Jeff | 08:03**
So bringing these two together is one who's deep in the theoretical side, and another who's a little bit more in the practical side, but still has that knowledge.
I think it's going to be really effective for us.

**Wesley Donaldson | 08:14**
I think it's going to be really effective for us.

**Jeff | 08:16**
The key is going to be getting their attention and getting them to truly be dedicated instead of being wandering away and the weed somewhere on whatever else they're looking into.

**Wesley Donaldson | 08:16**
The key is going to be getting their attention and getting them to truly be dedicated. It has to be... Instead of being wandering away in the we, do you have a sense of what their allocation is like, or are you still working that out with their managers?

**Jeff | 08:25**
So...

**Wesley Donaldson | 08:30**
Like, is it like two hours? We can expect like one meeting, one working, sessions said.

**Jeff | 08:33**
I know, their manager said. I told them I looked both of those guys in the eye and said, "I need these guys to be dedicated to this shit." They're like, "Yeah, no problem."

**Wesley Donaldson | 08:35**
I told them with both of those guys in the eye, "Any of these guys seem dedicated to this ship?" They're like, "Yeah, no problem."

**Jeff | 08:41**
I don't think that means anything until I talk to Sasha and Slava.

**Wesley Donaldson | 08:41**
And I don't think that means anything until.

**Jeff | 08:45**
So, you know, I think.

**Wesley Donaldson | 08:46**
So they got to control their faith there.

**Jeff | 08:48**
Yeah, you know, it's kind of like. Let's say you had an engineer who was great at writing, you know, applications and.

**Wesley Donaldson | 08:51**
Have an engineer who was great at writing, you know, applications and yet.

**Jeff | 08:57**
And yet he...

**Wesley Donaldson | 08:59**
And he could do the delivery work.

**Jeff | 08:59**
And he could do the delivery work.

**Wesley Donaldson | 09:01**
But he was one of those people whose head was in the clouds a bit.

**Jeff | 09:01**
But he was one of those people whose head was in the clouds a bit. He was constantly exploring all these different libraries and different techniques and different stuff like that.

**Wesley Donaldson | 09:04**
He's constantly exploring all these different libraries and techniques and stuff like that.

**Jeff | 09:09**
You don't want to slow that dude down from doing all that other stuff because it's what leads to him being so good at what he does.

**Wesley Donaldson | 09:09**
You don't want to slow that dude down from doing all that other stuff because it's what leads to him being so good at what he does.

**Jeff | 09:15**
But sometimes you need him just to put his head down and grind out something for delivery.

**Wesley Donaldson | 09:16**
Sometimes you... Him. Just like... Put his head down and bring out something for the library.

**Jeff | 09:19**
And that's kind of like.

**Wesley Donaldson | 09:19**
That's kind of... Which it's kind of like that with these guys, they're doing really important work.

**Jeff | 09:21**
It's kind of like that with these guys, they're doing really important work. They've got white papers they're offering, they've got experiments they're running, and all kinds of stuff.

**Wesley Donaldson | 09:27**
They've got white papers, they're offering, they've got experiments, they're running all kinds of stuff.

**Jeff | 09:32**
And then we're asking them to like, hey, can you just kind of get some blinders on for a second and focus on this one topic?

**Wesley Donaldson | 09:32**
And then we're asking, it's like, hey, can you just kind of, yeah, get some blinders on for a second to focus on one topic? And, you know.

**Jeff | 09:38**
And like, you know, and when they do, they'll.

**Wesley Donaldson | 09:39**
And when they do, they'll.

**Jeff | 09:40**
If they do find it interesting enough, they themselves will start to allocate their own time.

**Wesley Donaldson | 09:40**
If they do find it interesting enough, they themselves will sort of allocate their own.

**Jeff | 09:46**
And then we'll find that they really, you know, dive in.

**Wesley Donaldson | 09:46**
And then we'll find that they really.

**Jeff | 09:49**
And I'm not worried about that part.

**Wesley Donaldson | 09:49**
I'm not worried about that, but I just want to make sure that they are as interested as they could be.

**Jeff | 09:50**
I just want to make sure they are as interested as they could be. The only person I've talked to so far...

**Wesley Donaldson | 09:53**
The only person I've talked to so far is Sasha.

**Jeff | 09:54**
Sasha.
And he's into it.

**Wesley Donaldson | 09:56**
And he entered.

**Jeff | 09:57**
You know, he started asking me questions.

**Wesley Donaldson | 09:57**
You know, he started asking me questions.

**Jeff | 10:01**
He's like, "So how does this stochastic impression exactly work?"

**Wesley Donaldson | 10:01**
He's like, so how does this the cast of Impression exactly work?

**Jeff | 10:04**
I said, "I just looked at you and I said, Sasha, I'm an engineer, I'm not a mathematician."

**Wesley Donaldson | 10:04**
I said, "Guys looked at me and I said, Sasha, I'm an engineer, I'm not a mathematician. So I just felt like it was like that my bones moment from Star Trek or something.

**Jeff | 10:13**
So I felt like it was like that my bones moment from Star Trek or something. You know, I was like, "I'm not even going to start having this conversation with you because I don't know shit."

**Wesley Donaldson | 10:17**
You know, like, I'm not going to start having this conversation with you. Is I have a shit.

**Jeff | 10:25**
I do know some stuff, but it's only what I read.

**Wesley Donaldson | 10:25**
I do know some stuff, but it's only what I read.

**Jeff | 10:28**
I'm not like you.

**Wesley Donaldson | 10:28**
I'm not like you, someone who knows every little how these functions run and what is a good or bad component within the circuit and why and where the error threshold comes from.

**Jeff | 10:29**
I'm not like you, someone who knows every little how these functions run and what is a good or bad component within the circuit and why and where the error threshold comes from.
And I dude, that's beyond me.

**Wesley Donaldson | 10:40**
And I do think that's beyond me.

**Jeff | 10:43**
I theoretically could probably explain it to my brother, but to a mathematician, I'm not going to start talking to you about it.

**Wesley Donaldson | 10:43**
I theoretically could probably explain it to my brother, but to a mathematician I might start talking to you about how shit because I give me if you could just share.

**Jeff | 10:50**
I don't know shit. He goes, "Respect that."
Okay, there he goes. So...

**Wesley Donaldson | 10:56**
Where do you think his interest was peaked around? Was it more around just the idea of an interface around this is an idea of how to make it a gentic. Like where was the excitement? Mostly, I assume, it's not like how... We're sorry. Go ahead.

**Jeff | 11:12**
It's in the pure results of whether something can or cannot be simplified or optimized through error mitigation.

**Wesley Donaldson | 11:12**
It's in the pure results of whether something can, if not be simplified or optimized through error mitigation. That's where it is.

**Jeff | 11:21**
That's where it is. So he's way more interested in theoretically getting error mitigation to be valid, valuable, and necessary in order to run, as opposed to doing just pure error correction after the fact.

**Wesley Donaldson | 11:23**
So he's way more interested in theoretically getting error mitigation to be valid, valuable, and necessary in order to run, as opposed to doing just pure error correction after the fact.

**Jeff | 11:37**
So...

**Wesley Donaldson | 11:37**
So, and it's cool because he's like, "Yeah, I'm sure that there's something here, but exactly how it's done and what it can be effective for, what's when it's not effective for, it's not so clear."

**Jeff | 11:39**
And it's cool because he's like, "Yeah, I'm sure that there is something here. But exactly how it's done and what it can be effective for and what it's not effective for is not so clear." I started pointing out some of the other frameworks, and some of the other approaches to error mitigation and shared that with him.

**Wesley Donaldson | 11:52**
I started pointing out some of the other frameworks, and some of the other approaches to mitigation and shared that with him, and he went through them one by one. He was like, "Yeah, that one just started six months ago."

**Jeff | 11:59**
And he went through them one by one. He was like, yeah, that one just started like six months ago. And it's just by this.

**Wesley Donaldson | 12:03**
It's just by this I know this guy, and he's like this one, yeah, the company's got one in place, but he knew...

**Jeff | 12:05**
I know this guy, you know, and he's like this one, yeah, the company's got to want to get something in place, but nobody doses that.
You know, like, he just knew every single one of them. And he had history on it because he's in that community.

**Wesley Donaldson | 12:17**
Yeah, and because it's like, "Damn, dude."

**Jeff | 12:18**
So that was fascinating to me because it's like, "Damn, dude." I mean, I didn't know any of this from the outside.

**Wesley Donaldson | 12:21**
I mean, I didn't know any of this from the outside.

**Jeff | 12:24**
When you look, it's like looking at somebody's repo that says, "Hey, I got a repository."

**Wesley Donaldson | 12:24**
When you look, it's like looking at somebody's repo that says, "Hey, I got a repository that does this thing called the ketchup technique."

**Jeff | 12:29**
And it does this thing called the ketchup technique. And, you know, it's like, it's really cool.

**Wesley Donaldson | 12:31**
And, you know, it's like, it's really cool.

**Jeff | 12:34**
And like, you look at it and you go.

**Wesley Donaldson | 12:34**
And, like, you look at it, you go.

**Jeff | 12:36**
That's cool and everything, man.

**Wesley Donaldson | 12:36**
That's cool. Man, we'll see, it's really great the way it's written up.

**Jeff | 12:38**
That looks like. It's really great, the way it's written up.
It's going to work excellent.

**Wesley Donaldson | 12:40**
It's gonna work excellent. And then you find out some dude named Sam or and he know what the fuck is te.

**Jeff | 12:41**
And then you find out some dude named Sam wrote it, and he doesn't know what the fuck he's talking about, you know?

**Wesley Donaldson | 12:45**
You know, he's just like, you know, I will defend Sam and say that, like, his catchup technique doesn't work.

**Jeff | 12:45**
And he's just like, you know, like he's just some guy. I knew that would get him down. Mute. I knew it. I knew it.

**Wesley Donaldson | 12:56**
One last question. Sorry, like I'm just totally stealing all of the knowledge I can while Sam is making the car work the cease work. You mentioned that, like, he was super into QM. Great.
I think my curiosity there is like we are kind of the same both like we're it's interesting like we see how it works in the value of it. But I think Nicholas DA we wouldn't necessarily speak to just the complexity of, like, the underlining capability and functionality of QM like how Florians correction truly works underneath the hood.
So, like, my worry is I want to make sure we're meeting these folks where they want to be met. So if that's do we need to kind of pull Floride into the conversation? That way he can articulate that better and we can focus more on articulating.
Okay, cool. Here's how we're doing the optimizer. Here's how we're instrumenting actually being able to push in different circuits or push in different optimized values for QMM like what's your thoughts?
And like that separation of ownership.

**Jeff | 13:54**
Well, I think what we're doing here.

**Wesley Donaldson | 13:54**
Well, what we're doing here, we've reached a moment where we can hand off from Florin to these guys.

**Jeff | 13:58**
We've reached a moment where we can hand off from Florin to these guys, so...

**Wesley Donaldson | 14:04**
There you go. Okay, yeah, I mean, Foreign is the author of one ofmentary Matrix, and I've actually been at a lunch where he and SLA debated it pretty deeply.

**Jeff | 14:06**
And I've actually been at a lunch where he and Slava debated it pretty deeply. Yeah, I mean, Florin's the author of Quantum Memory Matrix. I've actually been at a lunch where he and Slava debated it pretty deeply. So I know that Slava is on top of the concept.

**Wesley Donaldson | 14:18**
So I know that Slava is on top of the concept.

**Jeff | 14:23**
So what I want to do is have a kickoff meeting with Florin.

**Wesley Donaldson | 14:23**
And so what? I want to do is have a kickoff meeting with Rinor, Slava, and Sasha.

**Jeff | 14:26**
Slava, Sasha.
Maybe Ruben.

**Wesley Donaldson | 14:30**
Maybe Ruben... Don't know on that, but basically those guys to talk to each other about what this is and then take that next conversation with Gusa and Slava to be with you guys so you can present what we've done so far and they can read through that as well as that pipeline and kind of say, "All right, we've consumed all this information."

**Jeff | 14:32**
Don't know. A little bit dicey on that. But basically those guys to talk to each other about what this is and then take that next conversation with just Slava to be with you guys so you can present what we've done so far and they can read through that as well as that pipeline and kind of say, "All right, we've consumed all this information, we've seen what you guys have done."

**Wesley Donaldson | 14:56**
We've seen what you guys have done.

**Jeff | 14:59**
Here's what we think we should do next.

**Wesley Donaldson | 14:59**
Here's what we think we should do next.

**Jeff | 15:00**
That's what I'm looking for, you know, because I think that they will quickly see where they can, you know, maybe they'll critique what we've done and say, you know, you're adding in this cycle of stcaastic compression, but the truth is, you don't need it.

**Wesley Donaldson | 15:00**
That's what I'm looking for. I think that they will quickly see where they critique what we've done and say, "You're adding in this cycle of statistical compression, but the truth is, you don't need it."

**Jeff | 15:15**
You should use this other thing.

**Wesley Donaldson | 15:15**
You should use this other thing.

**Jeff | 15:16**
I mean, that's what I'm looking for.

**Wesley Donaldson | 15:16**
I mean, that's what I'm looking for.

**Jeff | 15:18**
You know?

**Wesley Donaldson | 15:19**
You know?

**Jeff | 15:19**
I'm... I'm at the point...

**Wesley Donaldson | 15:19**
I'm at the point where they said the meeting this morning. I said, "Hey, if what we've done to this point is that we've informed ourselves and we've got the prerequisites in our minds about what this is and what it could be, but that we take it all and throw it out and start over, cool."

**Jeff | 15:20**
Like I said in the meeting this morning, I said, "Hey, if what we've done up to this point is that we've informed ourselves and we've got the prerequisites in our minds about what this is and what it could be, but that we take it all and throw it out and start over, I'm cool. I'm completely cool."

**Wesley Donaldson | 15:36**
I'm completely cool.

**Jeff | 15:38**
I just want to make sure were going down the right path now.

**Wesley Donaldson | 15:38**
I just want to make sure we're going down the right path now.

**Jeff | 15:41**
And I know that now is that time.

**Wesley Donaldson | 15:41**
And I know that now is that time.

**Jeff | 15:43**
Because if we're going to really make this a tool that gets used in product, so to speak...

**Wesley Donaldson | 15:43**
Because if we're going to really make this a tool that it's used in products, so to speak...

**Jeff | 15:49**
Great.

**Wesley Donaldson | 15:49**
Great.

**Jeff | 15:49**
But I said in the meeting, this is not a product that we've built so far, and I'm doing that for a reason.

**Wesley Donaldson | 15:49**
But I said in the meeting, this is not a product that will be built so far, and I'm doing that for a reason as Sam.

**Jeff | 15:55**
Sam knows what that is, which is the... I've got a product team with Sean and with Anyya that desperately want to control this.

**Wesley Donaldson | 15:55**
Those that is, which is the...
I've got a product team with Sean and with Anyya that desperately want to control this.

**Jeff | 16:06**
They want to get their sink their teeth into this and their claws into this, and they want to write every little specification down and have it all laid out in documentation and everybody agreed on a Miro board before they do a single thing.

**Wesley Donaldson | 16:06**
They want to get their sink their teeth into this and their claws into this, and they want to write every little specification down, have an all-way on documentation. Everybody agreed on the analysis.

**Jeff | 16:19**
And I'm not down with that, I'm not down with that at all.

**Wesley Donaldson | 16:22**
I'm not at all.

**Jeff | 16:23**
In fact, as I said in the meeting, if it wasn't for the work that we have done together, me and you guys to push QM to push Ubridge Core out the door to the degree that it got pushed out and this QMM work, I wouldn't have had to show the investor.

**Wesley Donaldson | 16:23**
In fact, as I've said to me, if it wasn't for the work that we had done together, me and you guys to push Cubber's core out the door to the degree that it got pushed out and this do number work, I wouldn't have hit as showing the investor.

**Jeff | 16:41**
Instead, we look like rock stars because the investors looked at it and they don't even care if it all works.

**Wesley Donaldson | 16:41**
Instead, we look like rock stars because the investors look at it and they don't even care if it all works.

**Jeff | 16:48**
They're just like, "Wow, these guys are pushing the envelope."

**Wesley Donaldson | 16:48**
They're just like, "Wow, these guys pushed the envelope and..."

**Jeff | 16:51**
And they felt good about that.
And we need him.

**Sam Hatoum | 16:53**
Managed to get them the actual... Did you show them screenshots or off the thing?

**Jeff | 16:58**
Demos, my friend. I went through...

**Wesley Donaldson | 16:59**
I went through...

**Jeff | 17:01**
Yeah, so I did from cloud code.

**Wesley Donaldson | 17:01**
Yeah, so I did it from Claude code.

**Jeff | 17:03**
I went through a live demo of Ubridge Core just by using CVA and getting.

**Wesley Donaldson | 17:03**
I went through a live demo of C&C core just by using C&D and getting...

**Jeff | 17:10**
I generated a data set with an LM.

**Wesley Donaldson | 17:10**
I generated a dataset with an...

**Jeff | 17:15**
I created a neural net and trained it right in front of them, and within a few minutes, I got the answer back, and it was done.

**Wesley Donaldson | 17:15**
I created a neural net and trained it right in front of them, and within a few minutes, you got the answer back, it was done.

**Jeff | 17:21**
And they were like, Wow.

**Wesley Donaldson | 17:21**
And they were lis wow.

**Jeff | 17:23**
I'm like, "Yeah, this is all AI-generated because we have an MCP server that basically exposes all the tools from CVA, and I'm not super familiar with what CVA could do when I came in."

**Wesley Donaldson | 17:23**
I'm like, "Yeah, this is all AI-generated because we have an MCP server that basically exposes all the tools from CVA, and I'm not super familiar with what CVA could do when I came in."

**Jeff | 17:38**
I'm the perfect test case because nobody's going to be familiar with it.

**Wesley Donaldson | 17:38**
And I'm a perfect tests because nobody's gonna be familiar with it.

**Jeff | 17:41**
And the onboarding and ramp up to me to use CBA was no minutes.

**Wesley Donaldson | 17:41**
The onboarding and ramp-up committee U CD was no minutes.

**Jeff | 17:48**
I just didn't I didn't need any time because it was just available to me in the M knew what to do, and all I needed to know is what my objective was.

**Wesley Donaldson | 17:48**
It just I be any time because it was just available to me. The other One knew what to do.
All I needed to know was what my objective was.

**Jeff | 17:56**
And boom, here's the result.

**Wesley Donaldson | 17:56**
And here's a result.

**Jeff | 17:58**
And so that was really impressive.

**Wesley Donaldson | 17:58**
And so that was really impressive.

**Jeff | 17:59**
Then right on the back of that, I said, okay.

**Wesley Donaldson | 17:59**
Then right on the back of that, I said, okay.

**Jeff | 18:03**
And we're innovating on some other things.

**Wesley Donaldson | 18:03**
We're innovating this, but we're trying to create tools that are useful for computers and for people who want to use them.

**Jeff | 18:06**
We're trying to create tools that are useful for quantum computers and for people who want to use them.
This is just a concept of something that we started working on, which is putting quantum memory matrix error mitigation in front of quantum computer runs to try to reduce the number of errors and optimize the circuits so that they cost less money and so on.

**Wesley Donaldson | 18:10**
And this is just a concept of something that we started working through, which is putting quantum memory matrix error mitigation in front of the quantum computer runs. They try to reduce the number of errors and optimize the circuits so that they cost less money and so on.

**Jeff | 18:28**
So immediately I said, so we're trying to do this as a general purpose tool to cost less money for people want to give Quan computers.

**Wesley Donaldson | 18:28**
So immediately I said so we're trying to do this as a general purpose tool, to my view. On computers, you can see your eyes light up.

**Jeff | 18:34**
You can see their eyes light up. And then the second thing I showed them the Little.

**Wesley Donaldson | 18:36**
Then the second thing I showed them was the little...

**Jeff | 18:39**
I had it running locally, thanks to Nicholas, because he gave me...

**Wesley Donaldson | 18:39**
I had it running locally thanks to Nicholas because he gave me an amount to...

**Jeff | 18:42**
Not to Nicholas, to Dominic.

**Wesley Donaldson | 18:43**
Too dominant, because he grabbed Nicholas's profile for the circuit and I slapped it in there and I had the whole thing laid down because Rinor and I just click on things and it popped up on the right side and I showed them the circuit.

**Jeff | 18:44**
Because he grabbed Nicholas's profile for the circuit, and I slapped it in there and I had the whole thing laid out just the way Nicholas does. I just clicked on things and it popped up on the right side and I showed them the circuit.
You could do this and that.

**Wesley Donaldson | 18:57**
You could do this and that and.

**Jeff | 18:59**
Then what blew their minds was I said, "By the way, is this interface as it is to ten days to build, maybe less, but about ten days?"

**Wesley Donaldson | 18:59**
Then what blew their minds was I said, "By the way, this interface as it is to ten days ago, maybe less, but about ten days."

**Jeff | 19:07**
And it was up and running and kind of what you see right here and they're just like, I said, yeah.

**Wesley Donaldson | 19:07**
And it was up and running of sea right here. And it's like, I said, yeah.

**Jeff | 19:12**
We were embracing all the fastest techniques of innovation and rapid development.

**Wesley Donaldson | 19:12**
We were embracing all the fastest techniques of innovation and rapid development.

**Jeff | 19:16**
And we just like to get things up in front of us so that we can see how they work and then work with our researchers to dive in.

**Wesley Donaldson | 19:16**
We just like to get things up in front of us so that we can see how they work and work with our researchers to dive in.

**Jeff | 19:23**
I said, "Let me show you how this could work for any application we have."

**Wesley Donaldson | 19:23**
I said, "Let me show you how this could work for any application."

**Jeff | 19:26**
And I just kind of dragged in another module and connected it.

**Wesley Donaldson | 19:26**
And I just kind of dragged in and connected.

**Jeff | 19:29**
PayPal, what the fuck? By then, the interface itself was impressive to them.

**Wesley Donaldson | 19:31**
But then that's amazing.

**Jeff | 19:35**
So that's the thing.

**Wesley Donaldson | 19:35**
So that's the thing.

**Jeff | 19:37**
We didn't have to have all our shit down.

**Wesley Donaldson | 19:37**
We didn't have to have all of our shit down.

**Jeff | 19:40**
I was presenting to people doing tech due diligence on the company for some of the largest investors in the tech space.

**Wesley Donaldson | 19:40**
I was presenting to people doing tech due diligence on the company for some of the largest investors in the tech space.

**Jeff | 19:48**
There are...

**Wesley Donaldson | 19:48**
There are...

**Jeff | 19:49**
These guys were professors and the head of quantum computing for another company and all this.

**Wesley Donaldson | 19:49**
These guys were professors and the head of quantum computing for another company and that means so much.

**Jeff | 19:55**
And they were blown away. So does it matter whether it was all done or not?

**Wesley Donaldson | 19:59**
You have no idea.

**Jeff | 20:02**
But as I pointed out in the meeting today, and I think... I'll say this time and again, it's not to insult anybody, but if I had followed the plan from the product strategy team...

**Wesley Donaldson | 20:03**
As I pointed out in the meeting today, and I think... I'll say this time and again, it's not to insult anybody, but if I had followed the plan through the product strategy team, I would have had nothing to show in that meeting.

**Jeff | 20:13**
I would have had nothing to show in that meeting, not a single fucking thing.

**Wesley Donaldson | 20:16**
Not a single fucking thing.

**Jeff | 20:17**
I would have had documents and Miral boards and, you know, maybe I'd have PA Q ARC.

**Wesley Donaldson | 20:17**
I would have documents and MIR own words and you know, maybe I'd have PQ are, but I wouldn't have anything in this space to show.

**Jeff | 20:23**
I wouldn't have anything in this space to show.
So the point is, "Hey, we're pushing the envelope, we're testing things."

**Wesley Donaldson | 20:26**
And so the point is like, hey, we're pushing the envelope for testing things.

**Jeff | 20:30**
I'm inviting everybody in these meetings to try to understand and contribute.

**Wesley Donaldson | 20:30**
I'm inviting everybody in these meetings to try to understand and contribute.

**Jeff | 20:34**
It's not all perfectly specked, and not all going through all those rituals and everything like that, but we're producing value because people are learning as we go, and we're all learning about this together.

**Wesley Donaldson | 20:34**
It's not all perfectly specked, and not all going through all those rituals and everything like that, but we're producing value because people are learning to go, and we're all learning about this together, and it's something that's going to really stick.

**Jeff | 20:48**
And it's if something is going to really stick, it's going to be because it sticks.

**Wesley Donaldson | 20:51**
It's going to be because it sticks. No other reason.

**Jeff | 20:53**
No other reason. Not because somebody thinks it's a great idea and then they're going to test it on the market and find out it sucks more that you people will use it.

**Wesley Donaldson | 20:54**
Not because somebody thinks it's a great idea, and then you're going to test it on the market, find out it sucks more.

**Jeff | 21:01**
So anyway.

**Wesley Donaldson | 21:03**
I don't think we had shared it.
Sorry, go ahead.

**Sam Hatoum | 21:05**
So I go ahead, go with you gohi go.

**Wesley Donaldson | 21:07**
Yeah, I don't think we're shared with the team that you presented, even at a high level, even just showing one screen grab of the optimizer, the circuit tester, so I'd love to...
I know Dom and Nicholas would go crazy to know that you felt confident enough to actually show visuals of that experience to the board. So I'm going to share that with the team.

**Jeff | 21:26**
I was confident until I did it 20 times because I had it running on my laptop.

**Wesley Donaldson | 21:28**
[Laughter] I had it running on my laptop and the very first thing that happened was Hubert's core broke.

**Jeff | 21:35**
The very first thing that happened was Ubridge core broke. It broke.

**Wesley Donaldson | 21:39**
Fucking broke.

**Jeff | 21:40**
It turned out to be an infrastructure issue that only I could fix.

**Wesley Donaldson | 21:40**
And it turned out to be an infrastructure issue that only caused me to fix.

**Jeff | 21:45**
But fortunately, I was on.

**Wesley Donaldson | 21:45**
But fortunately, Cam was on.

**Jeff | 21:46**
You know, it's like it was like, I think it was like 08:30 in the morning and on a weekday.

**Wesley Donaldson | 21:46**
You know, it's like it was like 08:30 in the morning and on a weekday, and I'm like, my God, I'm so fuck.

**Jeff | 21:52**
I'm like, "My God, I'm so fucked. I mean, I present this and just like anytime between now and like an hour from now, they're just going to call my name and it's broken and there's nothing I could do.

**Wesley Donaldson | 21:54**
I'm going to resent this in just like anytime between now and like an hour from now. They're just going to call my name and it's broken and there's nothing I could do.

**Jeff | 22:02**
And I was totally bummed out.

**Wesley Donaldson | 22:02**
I was totally bummed out. He goes, "Yeah, I don't know what happened, but there was an update in the node."

**Jeff | 22:04**
He goes, "Yeah, I don't know what happened, but there was an update in the node, and just took a shit."

**Wesley Donaldson | 22:07**
Just shit.

**Jeff | 22:09**
I'm like, "Okay, dude, please fix it first and then put it in control so it doesn't happen like that again."

**Wesley Donaldson | 22:09**
I'm like, "Okay, you please fix it first and then put it in control so it doesn't happen like that again."

**Jeff | 22:16**
And there was that.

**Wesley Donaldson | 22:16**
There was that. There was that for the presentation to the company.

**Jeff | 22:18**
Then for the presentation to the company, there was one investor in that presentation sitting in the front, and everybody else was the whole company sitting out there.

**Wesley Donaldson | 22:21**
There was one investor in that presentation sitting in the front and everybody else in the whole company. So we got rid...

**Jeff | 22:27**
And I went into.

**Wesley Donaldson | 22:27**
And I went into not for your guy software, but I went into a P 42 code engine and all my datasets and all my experiments were gone.

**Jeff | 22:29**
Not for your guys' software.
But I went into a TIK 42 code engine and all my datasets and all my experiments were gone. And I'm like, "What the fuck?"

**Wesley Donaldson | 22:36**
And I'm like, what the fuck?

**Jeff | 22:37**
I had David and Anya both try theirs.

**Wesley Donaldson | 22:37**
And I had David and I you both TED theirs and there's were all gone and nobody could figure out what was going on.

**Jeff | 22:39**
And there's were all gone. And nobody could figure out what the fuck was going on.
And it all turned out that we were all just logging into the wrong fucking place.

**Wesley Donaldson | 22:43**
It all turned out that we were all logging into the wrong place.

**Jeff | 22:47**
There's this weird shit that happened before it started that I had to work out, but I tried it like 20 times for Ubridge, and then the QMM thing, I didn't really have to go through the deep functionality.

**Wesley Donaldson | 22:47**
If it was just this weird shit that happened before it started that I had to work out, but I tried it like 20 times for QB and then the Q1 thing, I didn't really have to go through the deep functionality. It was time to run all that stuff, but just being able to show that was such a great thing, you know? And I can run it locally now too, and I feel more familiar, so it was really good.

**Jeff | 23:03**
There was going to be time to run all that stuff, but just being able to show that was such a great thing, you know?
I can run it locally now too, and I feel more familiar, so it was really good.

**Wesley Donaldson | 23:14**
I'll get it.

**Jeff | 23:15**
Yeah. Cor.

**Wesley Donaldson | 23:15**
Hour.

**Jeff | 23:16**
Deuce.

**Wesley Donaldson | 23:17**
That's of the gold, honestly, that you can attach an application, and that someone with an idea can go us your shit doesn't have to know all that much about onboarding and ramping up.

**Jeff | 23:18**
Gold. And honestly, you know that you can attach an application and that somebody with a LLM and an idea can go use your shit and doesn't have to know all that much about onboarding and ramping up.
That's fucking gold.

**Wesley Donaldson | 23:34**
That's a big cold.

**Jeff | 23:36**
I personally didn't realize how powerful that was until I tried to use it.

**Wesley Donaldson | 23:36**
I personally didn't realize how powerful that was that I tried to use.

**Sam Hatoum | 23:45**
Awesome.

**Wesley Donaldson | 23:45**
Awesome. Well, these investors.

**Sam Hatoum | 23:45**
Well, these investors, so what was the is it just board update or was it like, you guys seeking more money?

**Wesley Donaldson | 23:50**
So what was the is you say board up there or was it I seeping more money or I it's so we have invests.

**Sam Hatoum | 23:53**
What's going on?

**Jeff | 23:55**
It's due diligence. So. We have investors, you know, it's they've put up their money and now they do all the diligence to like that it's in all the money in escrow.

**Wesley Donaldson | 23:58**
What's going on? It's due diligence. So we have investors. It's they've put up their money and now they do all the diligence and like that it's in all of my escrow. So this whole due diligence bit is...

**Jeff | 24:08**
And so this whole due diligence bit is like, kind of like, okay, show us all everything behind the curtain, and then if we're satisfied, then the money's released, you know, that sort of thing.

**Wesley Donaldson | 24:11**
Like, okay, show us all everything behind the curtain.
And then if we're satisfied, then the money is released. You know, that's sort of thing.

**Jeff | 24:20**
So there ain't no small amount of money.

**Sam Hatoum | 24:25**
Yeah, I know, it's hundreds of millions, isn't

**Jeff | 24:28**
It? It's billions, dude.

**Sam Hatoum | 24:30**
That Wow.

**Jeff | 24:31**
Okay, nice crazy stuff.

**Sam Hatoum | 24:32**
Yeah, that's crazy stuff.

**Wesley Donaldson | 24:32**
Yeah, that's crazy stuff.

**Sam Hatoum | 24:35**
Somebody's going to crack this quantum.

**Wesley Donaldson | 24:35**
Somebody's going to crack this quantum.
It's whoever has got a good shot at commerciallyizing it, actually using it commercially, is the one that's going to win.

**Sam Hatoum | 24:37**
And whoever whoever's got a good shot at, like, getting commercializing it, actually usefully commercializing it is the one that's going to win. It doesn't matter how fucking good your stuff is, you can be the best in the world.

**Wesley Donaldson | 24:44**
It doesn't matter how good your stuff is. You can be the best in the world, but a tiny startup from nowhere that makes it accessible to normal human beings with something useful for people to land value. That's what counts, and it's exactly that. Yes, it could be a small sum.

**Sam Hatoum | 24:47**
If a tiny startup from nowhere makes it accessible to normal human beings or something useful for people to land value, that's what counts, it's as simple as exactly that.

**Jeff | 24:57**
Exactly that. Yeah, it's it could be a small start up. And my theory is this that we've missed the boat on building use right now.

**Wesley Donaldson | 25:01**
My theory is that we missed the boat on building use right now for the first space we have Chip Designs and everything else.

**Jeff | 25:08**
For the first space, we have the Chip Designs and everything Else and Cubic Designs.

**Wesley Donaldson | 25:12**
Cubic Designs for 30 years in the making.

**Jeff | 25:13**
But those are years in the making, and they could or could Not be effective down the road.

**Wesley Donaldson | 25:15**
It could or could not be effective down the road.

**Jeff | 25:18**
But for the current wave, that's already happening with D-Wave and with IQ and IBM and those guys, and we're getting...

**Wesley Donaldson | 25:18**
But for the current wave that's already happening, D-Wave and IQ and IBM and those guys, they would get it.

**Jeff | 25:28**
But the tools, the heart of the pipeline in the process like what we've been talking about with error mitigation and so on, it's wide open.

**Wesley Donaldson | 25:28**
But the tools, the heart of the pipeline process like what we've been talking about and so on, it's wide open.

**Jeff | 25:38**
And you can be a tiny startup and come in and build two or three utility tools that make it possible for somebody to do something at a quantum computer and just get first, you know, the first make on something viable.

**Wesley Donaldson | 25:38**
And you can be a tiny startup to come in and build two or three utility tools that make it possible for somebody to do something on a quantum computer or just get first, you know, the first make on something viable.

**Jeff | 25:51**
And you can become the FTP of the quantum computing world.

**Wesley Donaldson | 25:51**
And you can become the STP on Fun World.

**Jeff | 25:56**
You could be the guys that that's probably a terrible, you know, actual comparison.

**Wesley Donaldson | 25:56**
You can be the guys that that's probably a terrible, you know, actual comparison.

**Jeff | 26:02**
There's probably a better analogy, but you can become, you know, the search engine or whatever that everybody uses, you know.

**Wesley Donaldson | 26:02**
There's probably a better analogy, but you can become, you know, the search engine or whatever that everybody uses, you know.

**Sam Hatoum | 26:12**
Right, so what do we do next?

**Wesley Donaldson | 26:12**
Right? So what do we do next?

**Sam Hatoum | 26:14**
Is the question?

**Wesley Donaldson | 26:15**
The question... Well, a couple of things came to mind.

**Jeff | 26:17**
Well, a couple of things came to mind. One is, I don't know if we finished that last model of running on an actual QPU. That's something I think...

**Wesley Donaldson | 26:21**
One is, I don't know if we finished that last model of running on an actual QPU. That's something I think...

**Sam Hatoum | 26:32**
We put that on hold, right? Last time you said you wanted that.

**Jeff | 26:35**
Yeah.

**Wesley Donaldson | 26:35**
Yeah, and I think that does deserve some attention.

**Jeff | 26:36**
I think that does deserve some attention, just to hook up an API and say, "Okay, if we do, we need a separate MCP server to control jobs there and that kind of thing." So maybe we should talk a little bit about that

**Wesley Donaldson | 26:38**
Just to hook up an API and say, okay if we do, we need a separate MCP or to control jobs there, that kind of thing.
So maybe we should talk a little bit about that and then on what we're doing.

**Jeff | 26:49**
Then on what we're doing, there are a number of... As I said, other error mitigation techniques.

**Wesley Donaldson | 26:55**
There are a number of, as I said, other error mitigation techniques.

**Jeff | 27:01**
I don't know if it's going to be effective for us to make comparisons ourselves of those, but it might be interesting to go get hands-on a little bit to see if there's something we can learn.

**Wesley Donaldson | 27:01**
I don't know if it's going to be effective for us to make comparisons ourselves of those, but it might be Interesting to get hands-on a little bit and see if there's something we can learn.

**Jeff | 27:12**
I want to take direction from Sasha on that as to which ones he thinks are the most viable.

**Wesley Donaldson | 27:12**
I want to take direction from Sasha on that as to which ones he thinks are the most viable.

**Jeff | 27:18**
He was kind of giving me a verbal version of that before the presentation the other day.

**Wesley Donaldson | 27:18**
He's trying to give me a verbal version of that for the presentation today.

**Jeff | 27:24**
As far as what we're doing right now, I think all of the things that are underway have been really good.

**Wesley Donaldson | 27:24**
As far as what we're doing right now, I think all the things that are underway have been really good.

**Jeff | 27:32**
I didn't completely grok that what's been done completely aligns and correlates to what I wrote up in that document.

**Wesley Donaldson | 27:32**
I didn't completely grok that. What's been done completely aligns and correlates with what I wrote in that document.

**Jeff | 27:42**
So is that true in your mind?

**Wesley Donaldson | 27:42**
So is that true in your mind?

**Jeff | 27:44**
Because I saw in Nicholas's bit that it seems to be mostly true.

**Wesley Donaldson | 27:44**
Because I saw in Nicholas's bit that it seems to be mostly true.

**Jeff | 27:49**
I don't know.

**Wesley Donaldson | 27:49**
I don't know.

**Jeff | 27:50**
I didn't understand what fell on the floor or what was consolidated for that.

**Wesley Donaldson | 27:50**
I didn't understand what fell on the floor or what was consolidated. Well, that's the part I lost.

**Jeff | 27:54**
That's the part I lost.

**Sam Hatoum | 27:56**
Yeah.

**Wesley Donaldson | 27:56**
Yeah.

**Sam Hatoum | 27:56**
So what I told the team to do was go look at all the stuff that Jeff is trying to say, "Do we have these capabilities effectively, as I understand it? Correct me if I'm wrong."

**Wesley Donaldson | 27:56**
So what? What I told the team to do was let go and look at all the stuff that Jeff is trying to say. Do we have these capabilities? The fact that they... I understand it correctly. I'm wrong. Your document says here are all the capabilities we have, right?

**Sam Hatoum | 28:06**
Your document says here are all the capabilities we have, right?
Can we verify that we have them?

**Wesley Donaldson | 28:09**
And can we verify that we have them? Yes.

**Sam Hatoum | 28:12**
So then we took each one of those and said, "All right, well, let's put some verification around it."

**Wesley Donaldson | 28:12**
So then we took each one of those and said, "All right, well, let's put some verification on the best verification."

**Sam Hatoum | 28:16**
The best verification among along code is a test.

**Wesley Donaldson | 28:17**
A month on code is a test.

**Sam Hatoum | 28:19**
So you wrote a test for everything, right?

**Wesley Donaldson | 28:19**
So wrote the test to prove the gate.

**Sam Hatoum | 28:21**
To prove the capability.

**Wesley Donaldson | 28:22**
30.

**Sam Hatoum | 28:23**
And I think now it's a case of like, can we get those tests in your hands?

**Wesley Donaldson | 28:23**
And I think now it's a case of, like, can we get those tests in your hands?

**Sam Hatoum | 28:26**
Like, ideally, we can just walk through them and you can say, like, yes, that's what I expected.

**Wesley Donaldson | 28:26**
Like ideally, you just walk through them and you can say, like, yeah, that's what I expected.

**Sam Hatoum | 28:30**
No, that's not...

**Wesley Donaldson | 28:30**
No, that's not...

**Sam Hatoum | 28:30**
Or, you know, bring in the right people.

**Wesley Donaldson | 28:30**
Or you bring in the right people.

**Sam Hatoum | 28:32**
So that is what I think will be the next step to get the answer.

**Wesley Donaldson | 28:32**
So that is what I think will be the next step to get the answer of the people there.

**Sam Hatoum | 28:35**
You're looking for there. Which is...

**Wesley Donaldson | 28:36**
Because does it...?

**Sam Hatoum | 28:36**
You know. Does it? Have we proved them or not?

**Wesley Donaldson | 28:37**
Have we proved them or not?

**Sam Hatoum | 28:40**
But we've laid the groundwork to prove them.

**Wesley Donaldson | 28:40**
But we've laid the groundwork to prove them.

**Sam Hatoum | 28:42**
We've got the testing capability to prove them.

**Wesley Donaldson | 28:42**
We've got the testing capabilities to prove them.

**Sam Hatoum | 28:45**
And now, yeah, it's a question of, you know, you telling us, like, yeah, this is true, this is real, or this isn't, so you can verify that.

**Wesley Donaldson | 28:45**
And now you think it's a question of you telling us like, yes, this is true, this is good, or this isn't, so you can verify that.

**Jeff | 28:54**
Okay, that's probably a good thing to do.

**Wesley Donaldson | 28:54**
Okay, that's probably a good thing to do if we can step through some of that and the round table tomorrow.

**Jeff | 28:55**
Maybe we can even step through some of that in the round table tomorrow.

**Sam Hatoum | 29:00**
That's a good idea.

**Wesley Donaldson | 29:00**
That's a good idea.

**Sam Hatoum | 29:01**
Yeah, we can, so let's get that prepped.

**Wesley Donaldson | 29:01**
Okay, so let's get that prepped.

**Jeff | 29:03**
Okay? That's a good idea.

**Wesley Donaldson | 29:06**
Well, sorry, let me just say a little bit more there. Sam, we have X number of steps, 13 steps, 15. Forgive me for the exact number.

**Jeff | 29:13**
Yeah.

**Wesley Donaldson | 29:14**
We have support along X number of those, not all of those for each one of the things that Jeff listed.

**Sam Hatoum | 29:15**
I think for each one of the things that Jeff listed, let's go one by one and say, "Here's how we proved it with a test."

**Wesley Donaldson | 29:22**
Let's go one by one and say, "Here's how we prove it with us."

**Sam Hatoum | 29:25**
If we couldn't prove it with a test, we couldn't do that or if we could...

**Wesley Donaldson | 29:25**
And if we couldn't prove it with best, if we couldn't do that or if we couldn't, then somewhere I just commentary on each and every single one going and showing how the tests we created correlated to us and just open up the conversation.

**Sam Hatoum | 29:29**
And then somew whatever, like just commentary on each and every single one, showing how the tests we created correlate to those.
And just to open up the conversation, you know, if we missed something, we'll add it, if we overdid something or remove it.

**Wesley Donaldson | 29:36**
You know, if we missed something, why, if we overd something, we'll remove it.

**Sam Hatoum | 29:42**
So that was in my mind, Jeff, like how we can get the different modules verified to the degree that we know.

**Wesley Donaldson | 29:42**
So that was in my mind, just like how we can get the different modules verified to the degree that we know.

**Sam Hatoum | 29:50**
I mean, and that's what I was saying.

**Wesley Donaldson | 29:50**
I mean, and that's where I was saying, like if we can get Sasha and o person there.

**Sam Hatoum | 29:52**
Like, if we can get Sasha. And what was the other person's name?
Alex la SLA right. So if we can get the sas.

**Jeff | 30:01**
It's not confusing at all.

**Sam Hatoum | 30:02**
Love Sasha I can I've grown, I've had lots of Slavic friends.

**Wesley Donaldson | 30:05**
I've grown. I've had lots of Slavic friends.

**Sam Hatoum | 30:08**
So, yeah, so Slava... If we can get them to come and weigh in on the specs for these verifications and whether we're actually testing the right thing or not, that's what's going to make it real on a module-by-module basis.

**Wesley Donaldson | 30:08**
So, yeah. So Slava... As we can get them to weigh in on the specs for these verifications and whether we're actually testing the right thing or not, that's what's going to make it real on a module-by-module basis.

**Sam Hatoum | 30:23**
And then, the next thing is to have them give us more like end to end, like value driven specs.

**Wesley Donaldson | 30:23**
And then the next thing is to have them give us more like end to end like value proven specs like.

**Sam Hatoum | 30:31**
It's all fine that a module can do stochastic compression.

**Wesley Donaldson | 30:31**
It's all fine. A module can do stochastic compression, we can do that.

**Sam Hatoum | 30:33**
We can do that. We can do a you know, a module that does 1 plus one.

**Wesley Donaldson | 30:34**
We can do a. You know, a module that does 1 plus one.

**Sam Hatoum | 30:36**
You can... An adder.

**Wesley Donaldson | 30:36**
Can add numbers that we can do.

**Sam Hatoum | 30:37**
There are just as many numbers that we can do. We can handle that.

**Wesley Donaldson | 30:39**
We can handle that.

**Sam Hatoum | 30:40**
But the combination of all of them into something useful building a, you know, an agentic pipeline that does something valuable that's not in our wheelhouse, right?

**Wesley Donaldson | 30:40**
But the combination of all of them into something useful, building an agent pipeline that does something valuable that's not in our wheelhouse. I like that's Florians and Slava and et cetera.

**Sam Hatoum | 30:48**
Like that's Florian and Slava and Sasa.

**Wesley Donaldson | 30:52**
Yes, exactly.

**Jeff | 30:52**
Yeah, exactly. And I think.

**Wesley Donaldson | 30:53**
And I think that's what you're getting on really overall, like, let's get on doing that or let's be the, you know, the medians, the ghost in the machine.

**Sam Hatoum | 30:53**
That's what you were getting at, really overall. Let's get them doing that, but let's us be the dominions, the ghosts in the machine, or not the ghosts.

**Wesley Donaldson | 31:01**
Not the ghosts, actually, but we need the machine, and they need the ghost in the machine.

**Sam Hatoum | 31:02**
Actually, we will be the machine, and they will be the ghost in the machine.

**Jeff | 31:05**
Yeah, precisely.

**Wesley Donaldson | 31:05**
Yeah, precisely.

**Jeff | 31:06**
Yeah, they drive quality and value.

**Wesley Donaldson | 31:06**
Yeah, they drive quality and value, and what we drive is facilitation, so, yeah, we make it out of...

**Jeff | 31:10**
What we drive is facilitation. So, yeah, we make it happen. Let me show you something else though too, because I think this is what I was talking about where I was doing the test with Claude code just command line and I authenticated... Which is by itself just authentic...

**Wesley Donaldson | 31:15**
Let me show you something else though too, because I think this is what I thought about where I was doing a test for Claude code. Just command line and I authenticated I by nothing works.

**Jeff | 31:31**
Yeah.

**Sam Hatoum | 31:31**
So that works for that.

**Jeff | 31:34**
Yeah, I know, but if it works and then it just shows tools here I get the tools and I'm just going to show that it would...

**Wesley Donaldson | 31:36**
Then I just show tools right at the tools. And yeah, I mean, dude, it's crazy when I think about it that this stuff all actually works.

**Jeff | 31:41**
Yeah, I mean, dude, it's crazy when I think about it that this stuff all actually works.
Then I said, "I would like to generate books like there."

**Wesley Donaldson | 31:48**
I said I would like to generate books like there.

**Jeff | 31:53**
Oops. I'll type better one day.

**Wesley Donaldson | 31:57**
I'll type better one day.

**Jeff | 31:59**
There we go.

**Sam Hatoum | 32:01**
It is actually I found by the way, on that, no, I found a module that you plug in between your keyboard and it actually fixes these things.

**Wesley Donaldson | 32:03**
I found a module that you plug in between your keyboard and it actually fixes these things.

**Jeff | 32:09**
I need to fix something. Just show me.
Even this is messed up. No.

**Wesley Donaldson | 32:18**
Know what you mean.

**Jeff | 32:36**
I caused Liquid to generate the dataset.

**Wesley Donaldson | 32:36**
I cause liquid re generated is so my Holocraft is full of E Monty Python.

**Jeff | 32:40**
Yeah.

**Sam Hatoum | 32:42**
So my... Is full of eels. You know what that is?

**Jeff | 32:50**
No.

**Sam Hatoum | 32:51**
Monty Python. There was some sketch in...

**Wesley Donaldson | 32:52**
There was some sketch like you travel to another country.

**Sam Hatoum | 32:53**
He's like, "He travels to another country and wants to tell him he's trying to describe a matchbox."

**Wesley Donaldson | 32:56**
Once he's trying to describe a matchbox, he goes, "My hovercraft is full of eels."

**Sam Hatoum | 32:58**
And he goes, my hovercraft is full of eels.

**Wesley Donaldson | 33:01**
[Laughter] Here.

**Jeff | 33:03**
So here, look at this list of model types.

**Wesley Donaldson | 33:03**
We do this list of all and I'm like, "Cool."

**Jeff | 33:06**
I'm like, "Cool, do you already have a data set?"

**Wesley Donaldson | 33:07**
Do you already have a data set and like to generate one kind of follow-up which model?

**Jeff | 33:09**
Would you like to generate one kind of problem you're trying to model which model type?

**Wesley Donaldson | 33:12**
So I'm just going to go like this.

**Jeff | 33:12**
So I'm just going to go like this.
Okay, neural network, no data set, we generate and continue.

**Wesley Donaldson | 33:14**
Okay, neural network, no data set, these generate.

**Jeff | 33:31**
So this is... Then I got to the point here where I've got all the models listed.

**Wesley Donaldson | 33:32**
I mean, then I got to the point where I got all models listed.

**Jeff | 33:36**
I don't even...

**Wesley Donaldson | 33:36**
I didn't even bring a CSV and it's generating a synthetic dataset for me on the fly, and this is going to need my permissions as it goes.

**Jeff | 33:37**
I didn't even bring a CSV and it's generating a synthetic dataset for me on the fly, and it's just going to need my permissions as it goes.
It's like, "Fuck me."

**Wesley Donaldson | 33:46**
And it's like, I mean, it's so sweet straight up, man, you know?

**Jeff | 33:48**
It's. It's so straight up, man, you know, so sweet, because this is.

**Wesley Donaldson | 33:52**
So sweet because this is...

**Jeff | 33:55**
I can look at the steps as they come.

**Wesley Donaldson | 33:55**
I can look at the steps as the code. As presenting the code where it's going to be used to generate the dataset eventually, it basically just does all this stuff for you that lets you just genetically use the... Thing right off the bat.

**Jeff | 33:57**
It's presenting the code where it's going to use to generate the dataset eventually, it basically just does all this stuff for you that lets you just kinetically use the damn thing right off the bat.
To me, when I went into this, I was expecting this whole thing where I was going to get stuck.

**Wesley Donaldson | 34:10**
To me, when I went into this, I was expecting that this whole thing, I was going to get stuck.

**Jeff | 34:16**
Like, man, I didn't even know what's best.

**Wesley Donaldson | 34:16**
Like, man, I don't even know what's fast, you know?

**Jeff | 34:18**
You know? Look at this.

**Wesley Donaldson | 34:19**
Please, this everything's complete.

**Jeff | 34:21**
Everything's complete. 200 fucking rows.

**Wesley Donaldson | 34:22**
200 bucks in a rows got me a pick.

**Jeff | 34:23**
It got me a fit quality done.

**Wesley Donaldson | 34:24**
Quality done.

**Jeff | 34:27**
Like that is fucking cool.

**Wesley Donaldson | 34:29**
That is out been cool.

**Jeff | 34:31**
I mean, yeah, I'm not a data scientist, I'm not a CBA user.

**Wesley Donaldson | 34:31**
I mean, yeah, I'm not a data scientist, I'm not a CBA user.

**Jeff | 34:34**
And I know this was a simple, you know, a simple problem, the way it generated things, but I could take this as deep as I want to right here and the LMS right there to help me out.

**Wesley Donaldson | 34:34**
And I know this is a simple, you know, a simple problem, the way it generated things, but I could take this as deep as I want to right here.
And the arms right there and help me out and I just fucking love.

**Jeff | 34:46**
And I just fucking love it.

**Wesley Donaldson | 34:47**
It's just this is the kind of thing that when you investors saw this to you say so wait a minute, did you have to do this and I said, well, all those tools are exposed with definitions and examples, and the LL was able to consume that and understand what to do, so I didn't have to read any documentation.

**Jeff | 34:47**
It's just this is the kind of thing that when the investors saw this, they're just like, so wait a minute, you know, did you have to do this? And I said, "Well, all those tools are exposed with definitions and examples, and the LLM was able to consume that and understand what to do."
So I didn't have to read any documentation, no SDKs, no nothing."

**Wesley Donaldson | 35:08**
No SDKs or nothing, just get to use my LLM, and it just guides me right through the process.

**Jeff | 35:09**
I just get to use my LLM, and it just guides me right through the process. I could have brought my own dataset.

**Wesley Donaldson | 35:12**
And I could have brought my own dataset.

**Jeff | 35:14**
I could have brought my own version of the way I want to train the model.

**Wesley Donaldson | 35:14**
I could have brought my own version of the way I want to train the model.

**Jeff | 35:18**
All kinds of other things on top of this, as long as the tools facilitate it, then it was something that would work, and it did, and it worked that seamlessly, right in front of everybody.

**Wesley Donaldson | 35:18**
All kinds of other things on top of this, as long as the tools facilitate it, then it was something that would work, and it did, and it worked that seamlessly, right, for everybody.

**Jeff | 35:28**
And they're like, Wow, that's cool.

**Wesley Donaldson | 35:28**
And they're like, Wow, that's cool.

**Jeff | 35:29**
So what I was going to say is I feel like one of the things that we need to explore besides QM is to just go back over this bridge core a little bit and look for opportunities to truly attach some tools to it.

**Wesley Donaldson | 35:31**
So what I was going to say is I feel like one of the things that we need to explore besides QM is to just go back over this bridge core a little bit and look for opportunities to truly attach some tools to it. It one of those things that might be to attach a third party to it.

**Jeff | 35:50**
One of those things might be to attach a third party tool. So a third party MCP server.

**Wesley Donaldson | 35:56**
So a third party MCP server. I don't know which one you meant, but it might be interesting just to do that because it will open up a whole library and a whole world of things that we can bring as value adds to this.

**Jeff | 35:59**
Now, I don't know which one yet, but it might be interesting just to do that because it will open up a whole library and a whole world of things that we can bring as value adds to this.
It puts us in a position where we don't have to wait for the research teams to get around to finishing whatever the hell they're doing.

**Wesley Donaldson | 36:11**
It puts us in a position where we don't have to wait for the research teams to get around to finishing whatever the hell they're doing.

**Jeff | 36:18**
Like CVA was ready to go, right?

**Wesley Donaldson | 36:18**
Like CD was ready to go, right?

**Jeff | 36:20**
There are a lot of tools out there.

**Wesley Donaldson | 36:20**
There are a lot of tools out there these guys use all the time, and I don't really see any reason for us to wait for our own teams to build and finish things for us to show value with this type of an approach.

**Jeff | 36:21**
These guys use all the time, and I don't really see any reason for us to wait for our own teams to build and finish things for us to show value with this type of an approach.
The main approach that is valuable on a GenAI system is that you can attach anything, right?

**Wesley Donaldson | 36:34**
The main approach that is valuable on a GenAI system is that you can attach anything, right?

**Jeff | 36:41**
So I know it sounds like it's not a terrible idea to put a third party tool in here of some kind.

**Wesley Donaldson | 36:41**
So I don't know, it sounds like it's not a terrible idea for a third party tool of yours. I don't know what kind.

**Jeff | 36:45**
I don't know what kind. I'm not sure if we should build the... I said, the QPU thing or should that be an MCP server?

**Wesley Donaldson | 36:47**
I'm not sure if we should build the like I said, the Q review thing or should that be an MCP server?

**Jeff | 36:54**
And then we hit it through Ubridge core from the QM M application.

**Wesley Donaldson | 36:54**
Then we hit it through Ubridge core from the QMM application.

**Jeff | 36:59**
You know, I don't know, should be kind of interesting thing.

**Wesley Donaldson | 36:59**
You know, I don't know, to be kind of interesting thing.

**Jeff | 37:03**
I think connecting the dots here would be really good because we're going to have to connect them anyway eventually.

**Wesley Donaldson | 37:03**
I think connecting the dots here would be really good for connected. Anyway, I mentioned.

**Sam Hatoum | 37:10**
Yeah.

**Wesley Donaldson | 37:10**
Yeah.

**Sam Hatoum | 37:10**
I mean, I'm...

**Wesley Donaldson | 37:10**
I mean, I'm worried that anything we do is with a stab in the dark.

**Sam Hatoum | 37:12**
I'm worried that anything we do is a bit of a stab in the dark. If we don't have some direction from some real data scientists as to what they really do, that would land something, right?

**Wesley Donaldson | 37:15**
If you can have some direction from some real data scientists as to what they really do, that we land something, right?

**Sam Hatoum | 37:20**
Like if we.

**Wesley Donaldson | 37:20**
Like if we if what we're saying is like if we're building some technology, building blocks, some primitives, like some things that we can construct to make to get value.

**Sam Hatoum | 37:21**
If what we're saying here is like, look, we're building some technology, building blocks, some primitives, like some, you know, things that we can construct to make to get value. Now we're talking about stuff that's outside of our realm.

**Wesley Donaldson | 37:29**
Now we're talking about stuff that's outside of our realm. The boy was like, "Okay, we've got something from Florian."

**Sam Hatoum | 37:32**
Before it was like, "Okay, we've got something from Florian, we've got this QMM, we've got the CVA." These are all things that you guys know can provide value.

**Wesley Donaldson | 37:35**
We've got this QMM, we've got the CD. These are all things that you guys know can provide value.

**Sam Hatoum | 37:41**
I'm worried that if we start coming up with stuff on top here, like we could say, okay, here's a snowflake attachment or, you know, he's an integration with blah.

**Wesley Donaldson | 37:41**
I'm worried that we start coming up with stuff on top here, and if we could say, "Okay, here's a snowflake attachment or you're an integration with..." we could do that, but it's still... We'll be doing it more for demonstration's sake than any real value.

**Sam Hatoum | 37:48**
We could do that, but I just feel like we'd be doing it more for demonstration's sake than any real value. Which all that I can do.

**Jeff | 37:55**
No, the value I'm talking about, Sam, is...

**Wesley Donaldson | 37:55**
No, the valley. I'm talking about Sands.

**Jeff | 37:58**
So I know some very specific things that have to happen when people bring data to actually be processed on any of these algorithm libraries.

**Wesley Donaldson | 37:58**
So I know some very specific things that have to happen when people bring data to actually be processed on any of these algorithm libraries.

**Jeff | 38:08**
One of those things, for instance, is data preprocessing.

**Wesley Donaldson | 38:09**
One of those things, for instance, is data reprocessing.

**Jeff | 38:13**
So we talked about that a lot.

**Wesley Donaldson | 38:13**
So we talked about that, and if you remember, we talked about data preprocessing or someone to upload a dataset and do sort of this ETL analysis and that kind of thing.

**Jeff | 38:15**
If you remember, we talked about data preprocessing, where someone would upload a dataset and would do sort of this ETL analysis and that kind of thing. But there are third party tools that you know can help with that.

**Wesley Donaldson | 38:25**
But there are third party tools that you know can help with that.

**Jeff | 38:29**
So that's an example of some type of value in a pipeline that I would be interested in proving we can attach without us doing everything to make sure it works exactly the way it's supposed to, but just showing that we can attach this if we need data proof... If we need some other functionality in this.

**Wesley Donaldson | 38:29**
So that's an example of some type of value in a pipeline that I would be interested in proving and attaching without us doing everything to make sure it works exactly the way it's supposed to, but just showing that we can attach this if we need data proof... If we need some other functionality in this.

**Jeff | 38:53**
How do we make sure that we can attach that as seamlessly as possible?

**Wesley Donaldson | 38:53**
How do we make sure that we can attach that as seamlessly as possible?

**Jeff | 38:57**
The prerequisite thing that must be there is that it's something that is generic, so we can bring it in as an MCP server or something like that.

**Wesley Donaldson | 38:57**
The prerequisite thing that must be there is that it's something that is generic. So we can bring it as you have some piece server or something like that.

**Jeff | 39:08**
So, I mean, I can go look for that and I'll find something.

**Wesley Donaldson | 39:08**
So, I mean, I can go look for that and I'll find something.

**Jeff | 39:11**
If I find something that seems like it merits our attention and efforts, I'll...

**Wesley Donaldson | 39:11**
If I find something that seems like it merits our attention and efforts, I'll...

**Jeff | 39:16**
I'll bring it when I bring it.

**Wesley Donaldson | 39:16**
I'll bring it when I bring it.

**Jeff | 39:18**
I won't bring it.

**Wesley Donaldson | 39:18**
I won't bring it.

**Jeff | 39:18**
I'll bring it just like I did.

**Wesley Donaldson | 39:18**
I'll bring it just like it didn't see, or else it's like those...

**Jeff | 39:19**
See the a or anything else is like those. The reason that I brought those things in was because I knew that getting through the somewhat laborious effort of attaching CDBA and everything would then make it usable, like we just saw.

**Wesley Donaldson | 39:23**
The reason that I brought those things in is because I knew that getting through the somewhat laborious effort of attaching CDBA and everything would then make it usable,
like we just saw.

**Jeff | 39:36**
But is anybody using it that way?

**Wesley Donaldson | 39:36**
But is anybody using it that way?

**Jeff | 39:39**
I don't know, it's kind of not the point.

**Wesley Donaldson | 39:39**
I don't know, it's kind of not the point, kind of like, you know, we did it.

**Jeff | 39:42**
It's kind of like, you know, we did it now.

**Wesley Donaldson | 39:45**
Now we are not so intimidated by bringing in another product and doing the same sort of thing.

**Jeff | 39:45**
Now we are not so intimidated by bringing in another product and doing the same sort of thing.
So I want to just know that it's not going to be a bridge too far for us to bring in a third party tool.

**Wesley Donaldson | 39:50**
And so I want to just kind of know that it's not going to be a bridge too far for us to bring in a third party tool.

**Jeff | 39:57**
That's what I'm talking about.

**Wesley Donaldson | 39:57**
That's what I'm...

**Sam Hatoum | 39:59**
Yeah.

**Wesley Donaldson | 39:59**
There are these more than a week of work.

**Jeff | 40:00**
I don't think it's more than a week of work, honestly, as long as we've got something really clear.

**Wesley Donaldson | 40:01**
Honestly, as long as you get something really clear.

**Sam Hatoum | 40:04**
Okay, let's put that down.

**Wesley Donaldson | 40:04**
Okay, let's put that down.

**Sam Hatoum | 40:06**
Let's put that down as one item that we can hit.

**Wesley Donaldson | 40:06**
Let's put that down as one so that we can...

**Sam Hatoum | 40:08**
Yeah. Next one that I've got in my mind is like, when do we want to start building more on the, like, more robust pipeline approach, something that can be deployed, something durable, something that can restart something like all of that stuff.

**Wesley Donaldson | 40:10**
Next one that I've got in my mind is like when do we want to start building more on the like more robust pipeline approach, something that could be deployed, something durable, something that can be. STAR Seems like all of that stuff, there's a bunch of different people doing things that, you know, we're doing things with as pipeline and then I've got a second pipeline which is created that runs on the server.

**Sam Hatoum | 40:28**
There's a bunch of different people doing things. We're doing things with Auto's pipeline.
I've now got a second pipeline we just created that runs on the server. We're using Google's AD K, the agent development kit.

**Wesley Donaldson | 40:35**
We're using Google's AD K, the agent development kit.

**Sam Hatoum | 40:39**
There's a lot in the area of how you get the agents to orchestrate well together, and especially if you're running what we're doing now, which is just running passing the buck from one thing to another.

**Wesley Donaldson | 40:39**
There's a lot in the area of how you get the agents to orchestrate well together and especially if you're running what we're doing now, which is just passing the buck from one thing to another.

**Sam Hatoum | 40:50**
We've got the modules, but the whole orchestration around it and almost like a Kubernetes scheduler, right?

**Wesley Donaldson | 40:50**
We've got the modules, but the whole orchestration around it is almost like a Kubernetes scheduler, right?

**Sam Hatoum | 40:55**
But for what we've got there, because it gets complex, like some of the stuff.

**Wesley Donaldson | 40:55**
But for the note what we've got there because it gets complex, like some of the stuff.

**Sam Hatoum | 41:01**
I'll give you an example.

**Wesley Donaldson | 41:01**
I'll give you an example.

**Sam Hatoum | 41:02**
Florian was talking about this.

**Wesley Donaldson | 41:02**
Florian was talking about this and my... In the quarter.

**Sam Hatoum | 41:03**
I'm not sure if you're on the call yet, but you wanted us to run an experiment.

**Wesley Donaldson | 41:04**
But it was. He wanted us to run an experiment.

**Sam Hatoum | 41:06**
And that's actually another thing we can do that, you know, you can't remember now exactly.

**Wesley Donaldson | 41:06**
And that's actually nothing you can do that, you know, you can't remember now exactly that we have to go back over to the docs.

**Sam Hatoum | 41:11**
We'll have to go back over the docs. But you can vary quite a lot.

**Wesley Donaldson | 41:12**
But you can vary quite a lot.

**Sam Hatoum | 41:14**
Like the...

**Wesley Donaldson | 41:14**
Like the...

**Sam Hatoum | 41:16**
When you run the tests and you run like thousands, maybe hundreds of thousands of these tests and you want to collect the data back from them so that you can see...

**Wesley Donaldson | 41:16**
When you run the tests and you run like thousands, maybe hundreds of thousands of these tests and you want to collect the data back from them so that you can see...

**Sam Hatoum | 41:24**
I think the way he was saying is like you run it 1000 times and then out of... What was the most common occurrence out of those thousand times for that circuit?

**Wesley Donaldson | 41:24**
I think the way it was saying is if you run it a thousand times and then out of what was the most common occurrence out of those thousand times. Well, that's okay.

**Sam Hatoum | 41:32**
Now, run your Q, your QM M and then run those circuits again.

**Wesley Donaldson | 41:32**
Now run your QM and then run those circuits again.

**Sam Hatoum | 41:39**
Can you expand it from 600 out of a thousand to 800 out of a thousand?

**Wesley Donaldson | 41:39**
Can you expand it from 600,000 to 800 out of a thousand based on systems?

**Sam Hatoum | 41:43**
That is consistent, and that's effectively reducing error rate.

**Wesley Donaldson | 41:43**
And that's effectively reducing error rate.

**Sam Hatoum | 41:45**
So you don't care what the circuit is, actually, you just feel that there is a circuit, and you can reduce error on that circuit by looking at the Gaussian bell around it, right?

**Wesley Donaldson | 41:45**
So you don't care what the circuit is, actually, you just feel that there is a circuit. You can reduce error on that circuit by looking at the Gaussian bell around it, right?

**Sam Hatoum | 41:54**
So, you know, when we start thinking about those kinds of experiments, like the collection of data across a large data set, like it's a gather, scatter, gather, approach to like, you know, running different functions.

**Wesley Donaldson | 41:54**
So when we start thinking about those kinds of experiments like the collection of data across a large dataset, it's a gather, scatter, gather approach to running different functions, even though we have the individual modules, scheduling and scheduling them in a way that can achieve the experiment that Florian just spoke about, it's its own thing, right?

**Sam Hatoum | 42:07**
So even though we have the individual modules, scheduling and scheduling them in a way that can achieve the experiment that Florian just spoke about, it's its own thing, right? How do we define a pipeline that can achieve that?

**Wesley Donaldson | 42:16**
How do we define a pipeline that can achieve it, and you don't want to code it by hand every single time.

**Sam Hatoum | 42:18**
You don't want to code it by hand every single time. That sucks, right?

**Wesley Donaldson | 42:20**
That sucks. Or like you know send all who send this promise all and all.

**Sam Hatoum | 42:21**
Like you know send for send this promise all when all like it sucks.

**Wesley Donaldson | 42:25**
But it sucks. But you want something a bit more configurable.

**Sam Hatoum | 42:26**
You want something a bit more configurable. So that's what I want to talk about, scheduling and pipelines, that's what I'm talking about because we have exactly the same problem on auto, right?

**Wesley Donaldson | 42:28**
So that's what I mean when I talk about scheduling the pipelines, that's what I'm talking about because we have exactly the same problem.

**Sam Hatoum | 42:34**
We have like, okay, build model, build front and build backend.

**Wesley Donaldson | 42:34**
We have like. Okay, build, model, build fun and build back in.

**Sam Hatoum | 42:37**
Okay, that didn't work.

**Wesley Donaldson | 42:37**
Okay, that didn't work.

**Sam Hatoum | 42:37**
Now it needs to come back and reschedule that one.

**Wesley Donaldson | 42:38**
Now it needs to come back and we scheduled that one.

**Sam Hatoum | 42:39**
So there's this constant agentic loop that you have to do with corrections and things like this to get it to do something useful.

**Wesley Donaldson | 42:39**
So there's this constant agentic loop that you have to do with corrections and things like this to get it to do something useful.

**Sam Hatoum | 42:47**
So I'm wondering when the right time is that we want to do that.

**Wesley Donaldson | 42:47**
So I'm wondering when the right time is that we want to do that.

**Sam Hatoum | 42:49**
Because I feel like what we've got is a bunch of modules.

**Wesley Donaldson | 42:49**
Because I feel like what we've got is a bunch of modules, but together with something super useful and good.

**Sam Hatoum | 42:52**
To get them to do something super useful and good, especially if Alex or sorry, if Sasha and Slava and folks come and say, okay, let's try this.

**Wesley Donaldson | 42:54**
Especially if Alex or Sara and Slava, you know, folks come and say, okay, let's try this.

**Sam Hatoum | 43:01**
It's like, "Well, we can't because we have no way of running the pipeline like that."

**Wesley Donaldson | 43:01**
It's like, "We can't because we have no way of running the pipeline like that."

**Sam Hatoum | 43:05**
It runs just with what you can drag and drop right now, but there's not much capability.

**Wesley Donaldson | 43:05**
It runs just we what? You can brag and block right now, but there's Not much capability there.

**Sam Hatoum | 43:09**
That that's what I'm wondering.

**Wesley Donaldson | 43:09**
That's what I want to know.

**Sam Hatoum | 43:10**
When do we want to mature the pipeline scheduling capability?

**Wesley Donaldson | 43:10**
When you want to make sure the pipeline scheduling capabilities...

**Jeff | 43:15**
Really good question.

**Wesley Donaldson | 43:15**
Really good question.

**Jeff | 43:16**
I don't I mean, what's the big risk in, you know, in moving towards that now?

**Wesley Donaldson | 43:16**
I don't.
I mean, what's the big risk in, you know, in moving towards that now?

**Jeff | 43:22**
I mean, for me, I don't yeah, I don't say risk if it's not busy.

**Wesley Donaldson | 43:22**
I mean, for me, I don't.

**Sam Hatoum | 43:29**
It's for sure not busy one.

**Wesley Donaldson | 43:31**
Yeah, exactly.

**Jeff | 43:31**
Yeah, exactly. That's what I'm interested in.

**Wesley Donaldson | 43:31**
That's what I'm interested in.

**Jeff | 43:32**
If you come up with things that qualify as not busy work, that they're going to be at the very least something that, you know, saturates our knowledge so that we understand what we're dealing with or they're going to be sort of a precursor to us doing it more formally.

**Wesley Donaldson | 43:33**
You come up with things that qualify as not busy work that they are. They're going to be at the very least going to, you know, saturize our knowledge so that we understand what we're dealing with. Or is there going to be sort of a precursor to us doing it more formally?

**Jeff | 43:50**
That's fine.

**Wesley Donaldson | 43:50**
That's fine.

**Jeff | 43:52**
I guess if we're sure that that's going to be something that.

**Wesley Donaldson | 43:52**
I guess if we're sure that that's going to be something that contributes, then that's bi ma.

**Jeff | 43:56**
That contributes, then that's fine with me. What I'm really wanting not to do, though, is to lock down anything that's going to make it more difficult for them to do what you just said.

**Wesley Donaldson | 43:59**
What I'm really wanting not to do, though, is to lock down a thing that's going to make it more difficult for them to do what you just said.

**Jeff | 44:09**
Come in and say, "You know what?

**Wesley Donaldson | 44:09**
Come in and say, you know what?

**Jeff | 44:10**
Change the whole order of these things."

**Wesley Donaldson | 44:10**
Change the whole order of these things.

**Jeff | 44:12**
Change the whole order of these things. If they did that and it's going to disrupt us and make us have to start all over again, then something's not right.

**Wesley Donaldson | 44:12**
Like, you know, if they did that and it's going to disrupt us and make us have to start all over again, then something's not right.

**Jeff | 44:19**
So if you know it makes it more flexible, then that's good.

**Wesley Donaldson | 44:19**
So if you know it makes it more flexible, then that's good.

**Sam Hatoum | 44:23**
That's good.

**Wesley Donaldson | 44:23**
That's exactly that exactly like that, you know, and like I say, I in like eating this dog food lately there.

**Sam Hatoum | 44:24**
Exactly like that. You know, and like I say, I've been eating this dog food lately. I actually have already a pipeline orchestra in a building that we can just leverage right now, right?

**Wesley Donaldson | 44:30**
I actually have already a pipeline orchestra in a building that we can leverage right now, so we'll use that as our stopping position rather than from the market.

**Sam Hatoum | 44:35**
We would use that as our starting position rather than from nothing.
Right. So we can have something like we need to rewrite it.

**Wesley Donaldson | 44:39**
So we can have something we need to rewrite it.

**Sam Hatoum | 44:41**
We can.

**Wesley Donaldson | 44:41**
We can.

**Sam Hatoum | 44:41**
I've actually built two pipelines one that runs in the worker, which is like the builder that builds the software, another one that runs in our proprietary cloud, where we need our own scheduling.

**Wesley Donaldson | 44:41**
I've actually built two patterns. One that runs in the worker, which is like the builder that builds the software, and another one that runs in our proprietary cloud, where we need our own schedules.

**Sam Hatoum | 44:49**
So I've got two versions of a scheduler right now.

**Wesley Donaldson | 44:49**
So I've got two versions of the schedule now.

**Sam Hatoum | 44:51**
So I'm deep in this shit, you know?

**Wesley Donaldson | 44:51**
So I'm deep in the ship, I know how to build it, that we need it to be flexible because we don't know what we're doing, we don't know what we need next.

**Sam Hatoum | 44:53**
I know how to build it, and we need it to be flexible because we don't know what we're doing. We don't know what we need next.

**Jeff | 44:59**
Yeah.

**Wesley Donaldson | 44:59**
Yeah.

**Jeff | 45:00**
So you have your meetings, dude, because the trees are above you.

**Wesley Donaldson | 45:00**
So you want to have your meetings, dude, because the trees are above you.

**Jeff | 45:04**
We can actually call out if there's a widowmaker on the way down to take you out.

**Wesley Donaldson | 45:04**
And we can actually call out if there's a will maker on the way down to. And think about. [Laughter] And a lot of these in.

**Sam Hatoum | 45:10**
There's a lot of these here, man.

**Wesley Donaldson | 45:11**
Man, that's all there is in this area.

**Sam Hatoum | 45:11**
Like that's all there is in this area, you know?

**Wesley Donaldson | 45:13**
You may know.

**Sam Hatoum | 45:13**
You know what it's like?

**Wesley Donaldson | 45:13**
It's like, you know what a maker is, right?

**Jeff | 45:14**
Yeah, you know what a windowmaker is, right?

**Sam Hatoum | 45:17**
Yeah, of course.

**Wesley Donaldson | 45:17**
Yeah.

**Sam Hatoum | 45:18**
Yeah.

**Wesley Donaldson | 45:18**
Yeah, that sure happens in these sports.

**Jeff | 45:18**
That sure happens, man, in these forests.

**Sam Hatoum | 45:22**
Watch them. Okay, I will have it for the warning.

**Wesley Donaldson | 45:23**
Okay, we'll hear from the morning.

**Jeff | 45:27**
That it's going to do you.

**Wesley Donaldson | 45:27**
[Laughter] I think my job today is to say two things.

**Sam Hatoum | 45:28**
I've been. My job today has been two things. Like, one is to put the car seats in, and the other one is our drain is fucking getting into, like, into the house when it rains, but it's made it spotless.

**Wesley Donaldson | 45:31**
One is to put the coffee in, and the other one is that our brain has been getting into the house by the foot of the house and it rains.

**Sam Hatoum | 45:39**
Look at that shit.

**Jeff | 45:40**
Look at it's my drain getting above our house, it's fucked.

**Wesley Donaldson | 45:51**
Can't tell if you're serious.

**Jeff | 45:52**
Yeah.

**Sam Hatoum | 45:53**
If one brain is closed, you end up with water in your bathroom, you know what I mean?

**Wesley Donaldson | 45:55**
Is closed. You end up with water in your bos, you know, you try to figure it out.

**Sam Hatoum | 45:58**
He's got to figure it out.

**Jeff | 46:00**
No, at our place in Mill Valley, that's what it was like.

**Wesley Donaldson | 46:00**
No. And our place in I'll Valley, that that's what it was like.

**Jeff | 46:03**
We had a drain on the street, and it just got clogged with leaves, and then water just started rushing into our garage like a river.

**Wesley Donaldson | 46:03**
We had a drain on the street and it just got clogged with leaves, and then Bob just started rushing into our garage like a river, so I have to keep that line in check.

**Jeff | 46:12**
Yeah, exactly. I did that.

**Sam Hatoum | 46:15**
So I got to keep that one in check and the neighbors' ones and so on.

**Wesley Donaldson | 46:16**
The neighbors' one and so on.

**Sam Hatoum | 46:19**
Okay, cool.

**Wesley Donaldson | 46:19**
Okay, cool.

**Sam Hatoum | 46:20**
So I think I mean, the only thing I've got there is like so Dominic, you know, he's done some event sourcing in the past, and this is kind of related, so that's really good.

**Wesley Donaldson | 46:20**
So. So I think, I mean, the only thing I've got there is like. So Dominic, he's done some event sourcing in the past, and this is kind of related, so that's really good.

**Sam Hatoum | 46:31**
We can get Dominic jumpy hopping onto this.

**Wesley Donaldson | 46:32**
We can get fun hopping onto this and then we can keep Nico working on some of this, like experimental building modules, working with LAXS, lava fla, et cetera, if he gets the shit, so I think that'd be good.

**Sam Hatoum | 46:35**
And then we can keep Nico working on some of this, like experimental building modules, working with Alex, Slava, Flore and et cetera. Like he gets this shit, so I think that would be good. There is a lot of work.

**Wesley Donaldson | 46:45**
There is a lot of work.

**Sam Hatoum | 46:46**
I'll tell you this for now.

**Wesley Donaldson | 46:46**
I'll tell you this for now, like once we get the pipeline to make a number of robust and having the events and my keylogging problems and like this is definitely a bet, but that's the risk, it's all the risk is the reality.

**Sam Hatoum | 46:47**
Like for sure, like once we get into pipelines and making them robust and having the events and debugging problems and things like. This is definitely, you know, a bear that that's the risk.
It's not the risk, it's the reality. Actually, you're going to have to face this reality, you know, like, imagine when you have something like Kubernetes, right?

**Wesley Donaldson | 46:58**
Actually, you're going to have to face this reality, you know, like, imagine when you have something like Kubernetes, right?

**Sam Hatoum | 47:03**
And then you know, you have to have professionals like, you know, the Brian and co.

**Wesley Donaldson | 47:04**
And then you know, you have to have professionals like, you know, Brian and co.

**Sam Hatoum | 47:09**
Like that can actually take care of it.

**Wesley Donaldson | 47:09**
Like that can actually take care of it.

**Sam Hatoum | 47:10**
And if you put an amateur on, it's like it's not ideal, you know?

**Wesley Donaldson | 47:10**
If you go to Nashville and it's like. It's not. It's not ideal, you know?

**Sam Hatoum | 47:14**
Well, it's like once the...

**Wesley Donaldson | 47:14**
Well, like to the point of the Q people don't expect it.

**Jeff | 47:16**
To the point of the QPU job, Sam. People don't expect it, but they have their own cues, and they don't expect that it's going to take eighteen hours for their jobs and for their shots to start running.

**Wesley Donaldson | 47:21**
But they have their own queues and they don't expect that it's going to take, you know, eighteen hours for the job for their shots to start run.

**Jeff | 47:30**
Then when they run, you have to get status and all this kind of stuff back and deal with the feedback you're getting.

**Wesley Donaldson | 47:30**
Then when they're run, you have to get status and all this kind of stuff back and deal with the feedback you're getting on that.

**Jeff | 47:40**
So it's even that stuff, it doesn't have tools around it.

**Wesley Donaldson | 47:40**
So it's even that stuff, it doesn't have tools. It's just like it has indicators, and there's an API, but what do you do with that information, and what kind of action do you take when you get back?

**Jeff | 47:43**
It's just like it has indicators, and there's an API, but what do you do with that information, and what kind of action do you take when you get back? Something that says "job's over?"

**Wesley Donaldson | 47:50**
Something that says exactly like you got a pipeline running, right?

**Sam Hatoum | 47:52**
Yeah, exactly. Like you've got a pipeline running, right? It depends.
It has a billion things in it.

**Wesley Donaldson | 47:55**
It has a bill of things in it and now it sends it off.

**Sam Hatoum | 47:57**
Now it sends it off. But now you have to have almost a saga around it, and that is exactly what I was talking about, the complication.

**Wesley Donaldson | 47:58**
But now you have to, like, have all almost a saga around it. And that is exactly what I was talking about, the complication.

**Sam Hatoum | 48:02**
When it fails, what's our recovery path?

**Wesley Donaldson | 48:02**
When it fails, what's our recovery path?

**Sam Hatoum | 48:04**
When it passes, what do we do?

**Wesley Donaldson | 48:04**
When it passes? What do we do when it's what about when it's delayed?

**Sam Hatoum | 48:05**
What it's what about when it's delayed, what about it takes four days for it to come back?

**Wesley Donaldson | 48:07**
What about if it's four days for it to come back?

**Sam Hatoum | 48:09**
Do we what happens to our pipeline?

**Wesley Donaldson | 48:09**
We have a... Our pipeline.

**Sam Hatoum | 48:10**
We can't keep a synchronous process open.

**Wesley Donaldson | 48:10**
You can't keep a synchronous process open.

**Sam Hatoum | 48:12**
You have to keep a durability in the form of events.

**Wesley Donaldson | 48:12**
You have to keep a durability in the form of events.

**Sam Hatoum | 48:14**
So that's what that's precisely what I'm talking about.

**Wesley Donaldson | 48:14**
So that's what I think precisely what I'm talking about too.

**Jeff | 48:17**
Actually, there's something else that relates to this too, which may benefit from it, which is the guys on the TTML agent AI thing have long-running processes.

**Wesley Donaldson | 48:19**
Which may benefit from it, which is the guys on the TL on the H have long running processes.

**Jeff | 48:29**
Sometimes they take hours, sometimes they take days to complete, and as such, they don't seem practical to attach it to like Ubridge kind of thing.

**Wesley Donaldson | 48:29**
Sometimes they take hours. Sometimes they take days to complete.
As such, they... But it doesn't seem practical to attach it to a bridge kind of thing.

**Jeff | 48:41**
I think they need help with that, but they need help just scaling at all because they're running on a single node kind of thing.

**Wesley Donaldson | 48:41**
I think they need help with that, but they need help to scale at all because they're running on a single node kind of thing.

**Jeff | 48:50**
And you know, they're showing benchmarks and they're going, look at it compared to state of the art, you know, which is like, you know, massive parallel systems running, you know, in combination across huge numbers of clusters and, you know, high performance computing shit.

**Wesley Donaldson | 48:50**
And you know, they're showing benchmarks and they're going look at compared to state of the art, you know, which is like, you know, massive parallel systems running, you know, in combination across huge numbers of.
Plus, there's, you know, high performance computer shit they're running on a single boat.

**Jeff | 49:09**
They're running on a single node, and they're trying to act like their benchmark is something to pay attention to.

**Wesley Donaldson | 49:10**
They're trying to act like their benchmark is something to pay attention to.

**Jeff | 49:13**
And they said, we're getting close.

**Wesley Donaldson | 49:13**
And they said, we're getting close.

**Jeff | 49:15**
I'm like, I don't think you understand those digital or those decimal points.

**Wesley Donaldson | 49:15**
I'm like, "I don't think you understand those decimal points, guys. You're like orders of magnitude away from optimized, and it's all because you're not able to horizontally scale up parallel."

**Jeff | 49:19**
Guys, you're like orders of magnitude away from optimized, and it's all because you're not able to horizontally scale out and run into parallel. This is what you're talking about is probably going to be important for them to do their stuff.

**Wesley Donaldson | 49:29**
This is what you're talking about is probably going to be important for them to do their stuff.

**Jeff | 49:34**
So I think it's... There's more than just Q and... For them to benefit from this.

**Wesley Donaldson | 49:34**
So if I think that's... There's more than just yours.

**Sam Hatoum | 49:39**
Okay?

**Wesley Donaldson | 49:39**
Okay, so you and I spoke about this before.

**Jeff | 49:40**
So, all right.

**Sam Hatoum | 49:44**
You and I spoke about this before with Jeff.

**Wesley Donaldson | 49:45**
But, Jeff, I told you at the end of this month, Eagor is up for grabs.

**Sam Hatoum | 49:46**
I told you at the end of this month, Eagor is up for grabs, and you've worked with Eagor, you know?

**Wesley Donaldson | 49:50**
And you work with E or. You know.

**Sam Hatoum | 49:54**
Do you want to...?

**Wesley Donaldson | 49:54**
Do you...?

**Sam Hatoum | 49:55**
Do we have a possibility to add him to the team here?

**Wesley Donaldson | 49:55**
Do we have a possibility to add him to the team here?

**Sam Hatoum | 49:58**
I mean, just took a book, whatever the cost is times 1.5, basically.

**Wesley Donaldson | 49:58**
Just whatever the cost is times 1.5, basically, is the opportunity to do that?

**Sam Hatoum | 50:02**
Is there an opportunity to do that?

**Jeff | 50:04**
I think so. Just let me know that I've come back from this whole thing.

**Wesley Donaldson | 50:04**
I don't think so. Just let me know that I've come back from this whole thing through tomorrow.

**Jeff | 50:10**
Yeah, you know, think through the day tomorrow just point whatever.

**Sam Hatoum | 50:16**
If today's now, it's like two halves.

**Wesley Donaldson | 50:16**
If today's now, it's like two halves. You go to exp food in Neboro.

**Sam Hatoum | 50:18**
You basically just pay for two engineers. By the way, Wes and I are free or included, let's say.

**Wesley Donaldson | 50:20**
Mean we are free or included, let's say.

**Sam Hatoum | 50:24**
We just make that instead of 0.5 times two, it's 0.5 times three.

**Wesley Donaldson | 50:24**
We just make that instead of 0.5 to 25.6 to 0.5.

**Sam Hatoum | 50:28**
It's 1.5. If it's that, we can make it work.

**Wesley Donaldson | 50:29**
If it's that, we can make it work.

**Sam Hatoum | 50:30**
I'd just love to have Eagle come work with the guys on this.

**Wesley Donaldson | 50:30**
I'd love to have him come work with you guys on this.

**Jeff | 50:33**
I'm pretty sure we can.

**Wesley Donaldson | 50:33**
I'm pretty sure.

**Jeff | 50:35**
I just...

**Wesley Donaldson | 50:35**
I just...

**Jeff | 50:36**
Again, you know, I mean, I could just say, yeah, I could just say yes and everything be fine, but I'm just being overly cautious.

**Wesley Donaldson | 50:37**
You know, I mean, I can just. Yeah, I can just say yes be fine, but I'm just being overly cautious, so when we get through tomorrow, have a conversation.

**Jeff | 50:44**
So we'll get through tomorrow and have a conversation about stuff, and we'll go from there.
Yeah.

**Sam Hatoum | 50:49**
Let me... Because this is the guy now, like he's senior, like he's a gray beard, right?

**Wesley Donaldson | 50:50**
Yeah, this is the guy now, like he's seen it, but he's gray-bearded, right?

**Sam Hatoum | 50:53**
He's the guys young, they're awesome, don't get me wrong, they do a fantastic job.

**Wesley Donaldson | 50:53**
He's got the younger underg. They do a fantastic job.

**Sam Hatoum | 50:56**
But this guy, he's seen some stuff, so he knows.

**Wesley Donaldson | 50:56**
But this guy, he sees some shit, okay? So you know, you knows when things are going to go right wrong, et cetera.

**Sam Hatoum | 51:00**
He knows when things are going to go right, wrong, etc.
It would make me a lot more comfortable knowing that as we're going to build this and scale it out, that we've got someone that can support really well on the high scale stuff.

**Wesley Donaldson | 51:02**
I will make you a lot more comfortable knowing that as we're going to build this and scale it out that we've got someone that can support really well on the high scale stuff, right?

**Jeff | 51:11**
That's good. All right.

**Sam Hatoum | 51:14**
Cool.

**Wesley Donaldson | 51:14**
Cool.

**Sam Hatoum | 51:15**
Let's leave it at that.

**Wesley Donaldson | 51:15**
Let's think about that.

**Sam Hatoum | 51:16**
I think...

**Wesley Donaldson | 51:16**
I think...

**Sam Hatoum | 51:17**
Anything else?

**Wesley Donaldson | 51:17**
Anything else?

**Sam Hatoum | 51:18**
So actually, let me just repeat that, sorry, just act as an item we're going to start looking at.

**Wesley Donaldson | 51:18**
So let me just repeat that we're going to start looking at...

**Sam Hatoum | 51:22**
I'm going to start working with Dom on pipeline scheduling, etc., laying the foundational work, right?

**Wesley Donaldson | 51:22**
I'm going to start working with them on pipeline scheduling and for laying the foundational work for it.

**Sam Hatoum | 51:29**
That's part one, part two.

**Wesley Donaldson | 51:29**
That's possible.
But two, Niko's going to continue that explorations of like tomorrow we'll go through and get some feedback on the team about verification and then any feedback that comes back on that people folk can basically carry on and work on it.

**Sam Hatoum | 51:30**
Niko is going to continue down his explorations of tomorrow we'll go through and get some feedback from the team about the verification and then any feedback that comes back from that. No, we can basically carry on and work on it.
I think Florian did ask for an experiment to be done.

**Wesley Donaldson | 51:41**
I think Florian did ask for an experiment to be done.

**Sam Hatoum | 51:45**
We could actually put NKO on that experiment now and then that starts pushing the requirements of the pipeline.

**Wesley Donaldson | 51:45**
We could actually put Ele on that experiment now and then that starts pushing the requirements of the pipeline.

**Sam Hatoum | 51:49**
What do you think of that?

**Wesley Donaldson | 51:49**
What do you think of that, Jos?

**Jeff | 51:50**
Jeff? Yeah, I like that. That's good.

**Sam Hatoum | 51:52**
Right?

**Wesley Donaldson | 51:53**
Right. So that we're waiting.

**Sam Hatoum | 51:53**
That we're just waiting and then we're then in a we're not in a holding pattern.

**Wesley Donaldson | 51:54**
Then we're not holding... We're getting core experiments done, we're building a valuable pipeline, and we're waiting for feedback from Alex and SLA from Sasha and Slava.

**Sam Hatoum | 51:57**
We're getting Florian's experiments done, we're building a valuable pipeline, and we're waiting for feedback from Alex and SLA from Sasha and Slava.

**Wesley Donaldson | 52:02**
SLA so sorry, t two things, the sorry the third part tool Jeff, that's on you, right?

**Jeff | 52:05**
Okay, sounds like a good plan.

**Sam Hatoum | 52:07**
All right, there's a plan. Okay, thanks a lot to...

**Jeff | 52:10**
You all guys.

**Sam Hatoum | 52:13**
Go ahead. Where's... You got?

**Wesley Donaldson | 52:16**
So you're going to see if you can find something that's relevant you want to bring in.

**Jeff | 52:17**
Y.

**Wesley Donaldson | 52:19**
The other one I see here is just that you said onboarding for SLA and... That's I assume that's on you. That's something you're thinking about for early next week.
So the best-case scenario, we can expect to get in front of them late next week. Maybe the demo session or maybe a sync session with them.

**Jeff | 52:33**
Yeah.

**Wesley Donaldson | 52:34**
Yeah, exactly.

**Jeff | 52:34**
Exactly that. I'm going to try to get them to commit to being...

**Wesley Donaldson | 52:35**
Okay, so I'll ping you maybe Tuesday just to get on the calendar.

**Jeff | 52:37**
To appear next week on Thursday. That was good, all right.

**Wesley Donaldson | 52:43**
Alright, cool.

**Jeff | 52:44**
Okay, sounds like a good plan, Al.

**Wesley Donaldson | 52:45**
Nice by.

**Jeff | 52:46**
Right, brother, take it, easy fix.

