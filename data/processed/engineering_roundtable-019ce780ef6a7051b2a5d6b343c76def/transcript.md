# Engineering Roundtable - Mar, 13

# Transcript
**Jeff | 01:00**
We're from at California, so we're not.

**Wesley Donaldson | 01:01**
Guess what?

**Jeff | 01:03**
Yeah.

**Brian | 01:04**
I saw that headline too. There was something that happened that was only 20 minutes from me yesterday. Wow.

**Jeff | 01:13**
Hey, it's your bod.

**Wesley Donaldson | 01:13**
Brave world.

**Jeff | 01:16**
All right, I'm going to do something a little different today. I know that's kind of crazy, but let's see. A little different? I'm going to ask Brian to nominate someone to run this meeting. Brian, pick somebody, anyone. [Laughter] I said pick, I didn't say ask. You're already failing your assignment.

**Brian | 01:53**
Engineering. Cedric, you're up.

**Jeff | 02:00**
At his face. I love it to jump for that face. That's the reason.

**Speaker 4 | 02:03**
I want to do this.

**Jeff | 02:04**
I go cri.

**Speaker 4 | 02:08**
Are there any topics you want to talk about? Does anyone have anything to share?

**Brian | 02:12**
I'll help you, Cedric. Since we were both thrown under the bus, I do have something that's going to take me 10 minutes to prepare. I completely forgot about it, but I have an AI thing, a code review panel that I've been using. I got to set up the demo, so it'll take me about 10 minutes, but if someone else has something that can take 10 minutes... I got a short little demo of something that might be interesting.

**Jeff | 02:39**
Cedric and Lucas, what have you been working on? OOPs, I jumped in and did something, but I'm just a participant. I'm just asking.

**Speaker 4 | 02:46**
I'm just curious. Right? Yeah. No. So... There's been a lot of work around CADA at the moment. Right now, finishing out the whole publishing, like the new publishing and so on different OS labels and so on.
So there's a lot of work. Still there, but it's getting done. Looks good. Hopefully, we're going to finish by the end of next week. Fingers crossed. Yeah, so CD Air is not going to... Or is going to finally have a real CD PTN or a real reduced CD and they can actually just tip to install it and sound very exciting.

**Jeff | 03:36**
Is there a download portal, or is it just authentication that is the only thing to worry about?

**Speaker 4 | 03:43**
No, not yet. So right now the focus is on actually making the wheel available on our new artifact registry. Actually, which is gonna be the first thing to be down load loaded from that place after we got kicked out of he.
And. Yeah, and then we're gonna, like, create the download portal for the goo, I guess. And the excerpt again, like, correct me if I'm wrong. Sorry. Like, yeah, and yeah, it's gonna be, like, part of this.
And then C, the a is gonna be a real part of TEROCONTENT.

**Jeff | 04:27**
Now, all we have to do is get these crazy kids in line and make them think they actually work in the same company those guys. [Laughter] That's cool. Okay, what else? Subject... What? I mean, it's your meeting. I'm sorry, go ahead.

**Speaker 4 | 04:48**
Although that's not much, I guess from...

**Brian | 04:52**
One other thing related to CD since we're in the top, we're going to be... Taylor's not here. I think she'll be leading it. But we're going to be running our arc scanner against their network because they have their own...
So it'll be a dog-fighting exercise of what it might look like to scan within a customer environment that isn't TER quantum or anything else that we've been able to test against so far. So maybe the next week or two we'd have something to report on in terms of success or complete failure, and we need to go back and fix.

**Jeff | 05:31**
Have you ever scanned it before?

**Brian | 05:33**
Stefan, is that a question for me or does Stefan step up?

**Speaker 5 | 05:41**
We do regular scans like internal scans, I think every day, and from external every year.

**Speaker 6 | 05:51**
On CD you only...

**Jeff | 05:53**
What software are you guys using for that? I don't know that one. Link me, give me a link. That's cool, interesting. I'm interested in what information you get out of that. I'm sure everybody is. Have you looked at that?

**Brian | 06:17**
I haven't heard of that one, but scanning, is that like vulnerability scans or is there a focus on what type of scan?

**Speaker 6 | 06:29**
Yeah.

**Speaker 5 | 06:29**
Vulnerability and software burdens.

**Brian | 06:36**
So yeah, ours will be slightly different, right? It's just going to look at the network. So inside the network. But then just see what else you can see by reaching things in the network and then evaluating those protocols that it or those open ports that it can find for what cryptographic attributes appear to be available.
Then we would build reporting data off of that. So it's the first version of our cryptographic analysis scan.

**Speaker 7 | 07:07**
How long does it take or do we have no experience yet, so we can't really tell?

**Brian | 07:11**
I mean, I have run some benchmarks. It, of course, depends on the systems and everything, but it's not too bad. It's really a couple of seconds per system.

**Speaker 8 | 07:21**
Yeah, I ran it on my local network and it took under a minute.

**Jeff | 07:30**
Your local network, that's like you mean like your router, but yours is probably pretty complicated.

**Speaker 8 | 07:35**
I have a decent set up. There are 20 servers or something on my network here.

**Jeff | 07:43**
Almost as much as me. That's crazy centric.

**Wesley Donaldson | 07:47**
Have. 4.

**Speaker 8 | 07:49**
One question you mentioned a download portal for Clearview, is that the marketplace or is that something different?

**Speaker 4 | 07:58**
Maybe David can actually answer here. What's the process?

**Speaker 9 | 08:03**
To be for.

**Speaker 4 | 08:04**
Like a stars and so on?

**Speaker 9 | 08:06**
For CBA, we are basically thinking in the same approach that we have for TQ, ML, and TKM basically public accessibility to the software where any prospect can download to and then get authenticated through our portal to get the license key.
So same thing that TQ ML and TKM. The only difference with CBA is that our assumption is that the product is really valuable, but the problem is that it doesn't have enough exposure. We are going to try with the 30-day free trial.
So we will provide this license key somehow. By default, take how that works. For now, it's going to be manual. Then, as soon as we finish a pipeline about the payment gateway, the idea would be to have an MBP for a little more automatic license generation.

**Speaker 8 | 09:05**
Great, cool, yeah, so that's what we talked about. Awesome, just want to understand that well.

**Speaker 9 | 09:10**
Same plan Ban.

**Speaker 4 | 09:14**
That's your demo already.

**Brian | 09:18**
I can share, and it will probably be finished by the time I describe it a little bit.

**Jeff | 09:24**
Yeah, I'm... Better than the demo I did when I was standing in front of everybody. That was hilarious. Everything that could possibly go wrong before that demo was going wrong. It was really funny.

**Brian | 09:35**
It's the way they all... Yep, so this is something that's not...

**Jeff | 09:43**
We record. Can we record? So we put this on the cloud.

**Brian | 09:46**
So it's not that special, but we can record.

**Jeff | 09:49**
It's special you're doing... Recording in progress.

**Brian | 09:56**
Yeah, so this isn't novel or created by me. There are a lot of people around trying to do the same thing and variations on it, but I think it's cool. Some of you might have already done this. Some of you might not be exposed to this at all, might find this interesting.
So first, this is code, which I use quite a bit. You can prompt to just start writing software, but there are things called skills, which I would loosely describe as aliases or macros to perform some other actions.
What I have here is something called a code review panel skill. So usually the way I use this is when I'm making a pull request, I'll ask before I push, "Run a code review panel against my pull request" because I didn't have one ready. I'm actually running it against the entire project, the main branch.
So my prompt was just, "Please run a code review panel against the entire main branch." What it's going to do is it's going to spin up an LLM three. Claude LMS two. One of them is Opus 4.6, and one of them is Sonnet 4.6. They're all down here. Try to highlight them.
So the two different Opus ones are being prompted in two different ways. One's looking deep at the low-level code. One's looking at an architectural level, and then Sonnet's looking at it for itself.
I'm invoking Gemini and Codex for the same reasons. A lot of people find that Claude is a bit better overall at code architecture or code development. Gemini maybe a bit better at code and project architecture sometimes. Codex is a bit better at just low-level bug hunting.
So there is some value in running all of these, I think. I think I've been able to confirm myself. So what it does is it asks them all to run and perform the review, and then it summarizes all the results and prints out a nice table about what each found and how many of them had consensus on the same issue.
Unfortunately, it's still running. I was hoping it'd be complete by now, but let's see some of them. We got some results. The Opus deep analysis was completed. It found 23 things, 27 from Sonnet. Gemini is still running.

**Jeff | 12:37**
What code are you reviewing here?

**Brian | 12:40**
I'm this is the arc scanner, so it's the entire poness, so it's a Python.

**Jeff | 12:46**
So when you run this, do you just go to all cloud code things and go to the repo? You... If you haven't initiated Claude, you initiate that once you're at the repo directory and then you just fire this up.

**Brian | 13:02**
Yeah, in this case, I'm running Claude within the context of the change I want to review. Right? So in a lot of cases, I'm already within the branch of the pull request and then I'll run the Claude command line and then just... So it just understands...
I mean, I can specifically say... You can get flexible with it. You could actually say, it would actually do everything it needed to do, like clone the repository and check out the branch and just evaluate that pull request itself. Here we go. We got some...
So actually there's quite a few things I haven't done... This across the entire project. It is probably interesting. So a summary of findings right here. For some reason, Codex didn't look at the whole thing.
I'll have to look into that, but it is interesting. Claude actually comes back and reviews everything and provides a ranking on them as well. So for example, I found some particular bug that three of the four that ran all found and ranked as critical.
Then the next thing it will do is it will actually ask you what you want to do about each of these. You just want to press return and fix it. You can ask it about it. Much like you would in Claude Code, if you're familiar. You can just start chatting about the plan or whatever.
Anyway, this is what I used to try to clean up some code. Review code before I push it might be interesting. Some share this skill with anyone if they're interested in it.

**Speaker 4 | 14:31**
But you maybe show that like how this skill looks like or what especially you did there.

**Brian | 14:39**
Yeah, it's the skills are just the empty file. There's a little bit of a Python and too that helps it with the gathering, but generally it's just a prompt itself. This one's fairly long. That says you know how to orchestrate everything. How to invoke... I invoke Gemini and Codex via their CLI utils as well.

**Speaker 7 | 15:04**
I think this is the wrong audience since...

**Speaker 4 | 15:07**
Yeah, wrong.

**Jeff | 15:08**
Audience, and that's why we brought in Sam and Slava, but we'll get to that. We're going to have more focused data science discussions, etc.

**Speaker 7 | 15:20**
One thing I was wondering...

**Jeff | 15:22**
So go ahead. Lu is sorry, man.

**Speaker 7 | 15:25**
Nicholas, yesterday you showed the one example where you have this expected value and they should converge to it, right? Is it still not working for the QMM versions, or is it something we are working on, or is it something we know for now? I'm just wondering there.

**Nicolas Berrogorry | 15:47**
Yeah, our attention... Has it diverted from that for now? But it's intentional because from our discussions with Ruben, what we found is that different circuits require different types of evaluation, and that idea was like a really long one that you approached. Speaking of again, right?

**Speaker 7 | 16:08**
Yeah, it's again.

**Nicolas Berrogorry | 16:11**
I'm so sorry for that.

**Speaker 7 | 16:14**
I think I got the main point. That's maybe depending on the evaluations of different circuits, so I didn't know that.

**Nicolas Berrogorry | 16:19**
So it's dependent on different strategies for secret evaluation, just utilizing one value comparison and see if the values converge there. This is not going to be strong enough.

**Speaker 7 | 16:35**
Okay, thanks for that. I didn't know that, so it's new information for me. Thank you.

**Brian | 16:44**
Work on LMS. It's actually their code QL tech which indexes the codebase and then they write queries against it in their own code QL language. So that's the way that the security evaluation tool always works.
Now they're previewing this quality one, right? So anyway, we turned it on the ARC repo this week. It just looks at full requests and it's found a few unused imports and that kind of stuff didn't seem to... I was worried to be too noisy to write if you turn on a lot of this stuff, but so far it hasn't been too bad.

**Speaker 4 | 17:18**
But I'm wondering like there are some who is like I don't remember exactly like this copilot reviewer for example for the request is. There are the thing that just dance the whole repository for you. I don't know.
But, like, is everything enabled? Like, could we just. I could I just go forward and just like turn anything on, like on a specific repository. Like, would that work?

**Brian | 17:45**
I think we can. I think as far as I know, we have that stuff available to us. I don't know if the GitHub version is licensed or not, and if we wanted to use an LL M based one that wasn't from GitHub, I guess we'd have to talk about like a budget or something like that, right?
Because then we're going to be pulling tokens off of API the way I did mine. I'm just doing them off the, you know, 20 dollars a month personal plans be interesting. But if I burn through tokens, it doesn't hurt.

**Speaker 4 | 18:18**
Too bad because I guess we have a lot of like infrastructure like platform code that has been written prior to like the whole LL M CES and it would be interesting to like see how our code gets reviewed like as. Yes.
All right.

**Jeff | 18:46**
Well, another topic to bring up is our good old long-in-the-tooth sort of red-headed stepchild of compliance. We're going to have... I'm sure because I've been asked a lot lately about these kinds of things. We're going to have to start considering making individual applications compliant with certain standards.
So Stefan knows a lot about this. We've talked a lot and shared a lot of information that was really helpful. We didn't do much with that information. At least I made a judgment call or not really staffed for it.
This is our Vaanta dashboards. I'm actually interested in whether you would like to utilize Vaanta because we have it. You could use it, write tests, and use the agents they have. The tests that we have. Obviously, we have a lot of things that are not implemented.
If you just look at one of these things here, if I implemented multi-factor authentication on Jump Cloud, that would be fairly disruptive to everybody in the company. All of a sudden, you have to do multi-factor authentication.
It's a good thing to do. Implementing this like a draconian way from the top down is like on Slack and other things. This can actually be pretty crazy, or like password managers or this kind of thing.
So, it's just interesting that if there's a company-wide approach that you guys took, get the viz. You're compliant, and you're my cat doesn't like that. You're compliant at the company level, but I think we're probably leaning towards more application and platform-specific compliance.
So keep in mind that this stuff is needed for where we are in our investor cycles and some of the things Marcus talked about. We have to be in line. We've just recently had to answer things for Ernst and Young, for instance.
So I can anticipate that any aspirations to do things like go public or anything like that... You're going to have to do this company-wide probably, but at least from an application perspective, we should probably start thinking about getting our heads around this. I don't know if anybody else has anything to say on this. I'm sure that it's a real pain in the ass because we need to get to an initial audit, and then we need to take the information from that audit and get to the second level, get to another audit, which becomes the measure, and then we use that for three years.

**Brian | 22:08**
So at the application level, we may be sitting a bit better than at the IT level because... And I have been working, unfortunately, Kosman's not here, but have been working through the checklist boxes for the cloud environments that we have deployed to, right?
So a lot of those things actually are addressed. If we end up having targets for specific application environments, I'm sure Kosman can definitely support cleaning up what's remaining. But my general feeling is it's probably like the IT stuff, for example, you just hired, turning on MFA for all the laptops and stuff, that we have bigger gaps on it.

**Jeff | 22:50**
Yeah. I mean, some of our policies are out of date. Like the HR and employee policies thing. And some of them are just really pedantic things we need to do, just a list and checking boxes. But yeah, it's interesting that this is coming at us.
I know for sure that it'll always arrive at a time when you don't necessarily want it to unless you stay ahead of it.

**Brian | 23:20**
So do we have targets that we can throw out there and just start evaluating meaning like TQ 42 versus something?

**Speaker 11 | 23:30**
Yeah, I think we were talking about the product workshop about potentially using routing. No, sorry, I didn't draft routing.

**Brian | 23:43**
Is that what you said?

**Speaker 11 | 23:45**
Yeah, there was. I mean, there was some discussion around potentially doing routing simply because there's demand to turn it into an API so we can deliver it to some potential customers like Swiss Air and Swiss Post, et cetera. Those discussions are ongoing.
But there was a mention of that.

**Jeff | 24:01**
Yeah. It's a requirement to be a partner. So that's a great example of where we may or may not be able to be ready for business to be ready to work with someone or integrate with their systems or provide services or join their network of partners.
If we're not compliant, if we're not certified in that respect, we won't be able to do it. So that's the reason we got buy-in in the first place. We ran into this and got... There were a lot of opportunities that seemed like we needed to be compliant, and instead, we ended up doing things like answering a security questionnaire.
That was enough. That is enough for some. But those are more like the one-off. Someone just wants to use an algorithm library or something that's not inviting an application on their partner network.

**Brian | 25:03**
Yeah, maybe we should get legal to weigh in, right? Because if these are things like SOC 2 or whatever, my gut feeling is that that's an organization compliance thing, not a posting environment thing for the most part.

**Jeff | 25:19**
Well, I mean, both of them are possible for applications. I already know that from all the prior research that I did on that, but you're... It's typically not worth it to do it just for an application for something like SOC 2.

**Brian | 25:37**
Well, I think that from my Volkswagen experience, right? The people that are asking for that is because they have their own legal mandates that their partners that they're partnering with are compliant with XY and Z and that means the organization...
I think this is a Divis thing that they're probably familiar with. That's why they're doing it, right?

**Speaker 4 | 26:02**
Maybe one more question here. Like, is it going to affect, like, our day to day life? Like, in terms of like, do we have like. Are we gonna have more restrictions on our machines? Yes awesom.

**Brian | 26:21**
The biggest thing was to take away administrator rights from every user.

**Jeff | 26:28**
So...

**Brian | 26:29**
That installed...

**Speaker 6 | 26:31**
I need to call Philip that he enters the admin password that I can install software.

**Jeff | 26:38**
What? My God. Every single computer in the device company I have given...

**Speaker 5 | 26:46**
Every single installed has to be documented and requested before.

**Jeff | 26:53**
Yeah, every...

**Brian | 26:54**
Software version needs to be checked.

**Jeff | 26:58**
And documented.

**Speaker 5 | 26:59**
With every update.

**Jeff | 27:02**
How do you deal with like auto updates then?

**Brian | 27:06**
Well, you may have that wrong Jump Claude. That's all policy andudited from Jump Claude, right?

**Jeff | 27:14**
It would be for us. Yeah.

**Brian | 27:16**
I guess I've gotten used to it.

**Jeff | 27:20**
But I have people added... Everybody has a Mac, and I have people added to device groups that automatically prompt them to update their OS, for instance. I guess that would be... You're right, Brian. Probably Claude is the point there. It'll be the place where it's logged, and we don't have to really do anything manually.
So that's good.

**Brian | 27:41**
But those are system updates too, right? I've got used to this from Volkswagen. I have to do that. It's not as bad if you're willing to do things like run homebrew and install all your binaries in your home directory. Not a system level.
I think that's actually compliant, right? If you get away with stuff like that for your workflow, you don't have to request permission for every single one because you're just working within your home user context.

**Speaker 6 | 28:07**
Yeah, I mean, the idea is that someone controls what everyone is installing. So yes, it's possible, but that's not the ideal of the olding.

**Brian | 28:20**
You're doing it depends on your auditor, right? I think I got that past Volkswagen somehow, but it depends on what you're here in.

**Speaker 6 | 28:29**
Then of course everything is fine.

**Speaker 4 | 28:35**
But this happen like on a client basis. But like if you have to do like a specific client thing, then you'll have to work on a specific machine. No. Otherwise, I just set, like the machine with elevated.

**Speaker 6 | 28:53**
But this depends on the client, actually. So if you have the highest level with BMW and they say, "Okay, you're working on prototypes or something, which we do, but we don't..." Then you have to have your own room with your own computer with the Windows in a way that nobody can look into it and such stuff.
But that's not something we deal with. We have seen the things you had or have to do when you want to do this.

**Brian | 29:30**
Maybe even it's something...

**Speaker 6 | 29:33**
But the locks are here. So, and stuff like this. So, yeah.

**Jeff | 29:42**
A world I do not want to live in.

**Speaker 6 | 29:44**
And then I thought to be compliant. And I think it took us like a year to get to the first audit.

**Speaker 5 | 29:53**
I'm already planning for the next one, which is the first quarter of next year, so I'm already thinking about starting preparation for the next audit.

**Jeff | 30:06**
Wow, one question came up at some point. I think you know somebody looking for an easy button. We're talking. Like I. He was. Fla. And I were talking and, actually it was about Solons. So in the routing and I mentioned that the application needs to be certified or compliant to be on their partner at network.
And his question was, well, can't we just issue that application through Divis? That since they're compliant?

**Speaker 6 | 30:42**
So we don't have certificates for the applications, so that's not the thing. But if you want to do contracts with people who request tzs or something, that's possible, of course. But then, from our point, we cannot give the data to tele quantum if we want to be sure that it's within the network.
But yeah.

