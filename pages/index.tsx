import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Head from 'next/head';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: "Hey, I'm here to answer your questions about Labour party's latest policy release and contextualise it with data from public attitudes surveys. What would you like to know about first?",
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      <Layout>
		<Head>
			<title>Labour Policy ChatBot</title>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		</Head>
		<body className="is-preload">

			{/*wrapper*/}
				<div id="wrapper">

				{/*Main*/}
					<div id="main">
						<div className="inner">

							{/*Header*/}
								<header id="header">
									<a href="jethroreeve.github.io" className="logo"><strong>Labour Policy Chatbot</strong> Jethro Reeve & @Mayowaoshin</a>
									<ul className="icons">
										<li><a href="https://twitter.com/JethroJethroR" className="icon brands fa-twitter"><span className="label">Twitter</span></a></li>
										<li><a href="https://www.linkedin.com/in/jethroreeve/" className="icon brands fa-linkedin"><span className="label">Linkedin</span></a></li>
										<li><a href="#" className="icon brands fa-medium-m"><span className="label">Medium</span></a></li>
									</ul>
								</header>

							{/*Content*/}
								<section>

									<div className="mx-auto flex flex-col gap-4">
									<h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
										Ask questions about Labour&#39;s policy plans, and understand how they relate with national social attitudes
									</h1>
									<main className={styles.main}>
										<div className={styles.cloud}>
										<div ref={messageListRef} className={styles.messagelist}>
											{messages.map((message, index) => {
											let icon;
											let className;
											if (message.type === 'apiMessage') {
												icon = (
												<Image
													src="/person.webp"
													alt="AI"
													width="40"
													height="40"
													className={styles.boticon}
													priority
												/>
												);
												className = styles.apimessage;
											} else {
												icon = (
												<Image
													src="/red_rose.webp"
													alt="Me"
													width="30"
													height="30"
													className={styles.usericon}
													priority
												/>
												);
												// The latest message sent by the user will be animated while waiting for a response
												className =
												loading && index === messages.length - 1
													? styles.usermessagewaiting
													: styles.usermessage;
											}
											return (
												<>
												<div key={`chatMessage-${index}`} className={className}>
													{icon}
													<div className={styles.markdownanswer}>
													<ReactMarkdown linkTarget="_blank">
														{message.message}
													</ReactMarkdown>
													</div>
												</div>
												{message.sourceDocs && (
													<div
													className="p-5"
													key={`sourceDocsAccordion-${index}`}
													>
													<Accordion
														type="single"
														collapsible
														className="flex-col"
													>
														{message.sourceDocs.map((doc, index) => (
														<div key={`messageSourceDocs-${index}`}>
															<AccordionItem value={`item-${index}`}>
															<AccordionTrigger>
																<h3>Source {index + 1}</h3>
															</AccordionTrigger>
															<AccordionContent>
																<ReactMarkdown linkTarget="_blank">
																{doc.pageContent}
																</ReactMarkdown>
																<p className="mt-2">
																<b>Source:</b> {doc.metadata.source}
																</p>
															</AccordionContent>
															</AccordionItem>
														</div>
														))}
													</Accordion>
													</div>
												)}
												</>
											);
											})}
										</div>
										</div>
										<div className={styles.center}>
										<div className={styles.cloudform}>
											<form onSubmit={handleSubmit}>
											<textarea
												disabled={loading}
												onKeyDown={handleEnter}
												ref={textAreaRef}
												autoFocus={false}
												rows={1}
												maxLength={512}
												id="userInput"
												name="userInput"
												placeholder={
												loading
													? 'Waiting for response...'
													: 'Type a question'
												}
												value={query}
												onChange={(e) => setQuery(e.target.value)}
												className={styles.textarea}
											/>
											<button
												type="submit"
												disabled={loading}
												className={styles.generatebutton}
											>
												{loading ? (
												<div className={styles.loadingwheel}>
													<LoadingDots color="#000" />
												</div>
												) : (
												// Send icon SVG in input field
												<svg
													viewBox="0 0 20 20"
													className={styles.svgicon}
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
												</svg>
												)}
											</button>
											</form>
										</div>
										</div>
										{error && (
										<div className="border border-red-400 rounded-md p-4">
											<p className="text-red-500">{error}</p>
										</div>
										)}
									</main>
									<footer className="m-auto p-4">
									<a href="https://twitter.com/mayowaoshin">
										Powered by LangChainAI. Demo built by Mayo (Twitter: @mayowaoshin).
									</a>
									</footer>
									</div>

									{/* <span className="image main"><Image src="images/pic11.jpg" alt="" /></span> */}

									<br></br><p>UK media and political spheres anticipate that Labour will win the general election taking place in January 2025 (latest). <a href="https://www.ft.com/video/1ba870d3-fd96-453a-aabc-2a35337a5830?emailId=463c0f60-092d-4a1b-b43e-61a188a79276&segmentId=c393f5a6-b640-bff3-cc14-234d058790ed" target="_blank" rel="noopener noreferrer"> Check out this neat FT video on the topic.
									</a><br></br>
									</p>
									<p>
									This chatbot is designed to make it easy to understand their policy as it relates to you, as well as the related <a href="https://natcen.ac.uk/publications/british-social-attitudes-39-broken-britain">attitudes of other Brits</a>.
									</p><br></br>
									<p>
									This project uses the GPT-3 language model by OpenAI.
									</p>

									<hr className="major" />

								</section>

						</div>
					</div>
				</div>

			{/*scripts*/}
				{/* <script src="assets/js/jquery.min.js"></script>
				<script src="assets/js/browser.min.js"></script>
				<script src="assets/js/breakpoints.min.js"></script>
				<script src="assets/js/util.js"></script>
				<script src="assets/js/main.js"></script> */}

		</body>
      </Layout>
    </>
  );
}
