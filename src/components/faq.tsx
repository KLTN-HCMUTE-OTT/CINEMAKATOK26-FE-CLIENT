import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqData = [
  {
    group: "About Streamvid",
    items: [
      {
        question: "What is StreamVid ?",
        answer:
          "Blandit libero volutpat sed cras ornare arcu dui. Interdum consectetur libero id faucibus nisl tincidunt eget nullam non. Vestibulum lectus mauris ultrices eros. Sit amet justo donec enim. Egestas purus viverra accumsan in. Venenatis a condimentum vitae sapien pellentesque habitant morbi tristique.",
      },
      {
        question: "What does StreamVid TV include?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae purus a lectus semper consequat a at felis.",
      },
      {
        question: "Can I watch StreamVid TV on my phone?",
        answer:
          "Mauris sed neque id nisl lacinia imperdiet. Etiam vitae purus a lectus semper consequat a at felis.",
      },
      {
        question: "How do I cancel StreamVid TV?",
        answer:
          "Suspendisse potenti. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra tellus.",
      },
    ],
  },
  {
    group: "Setup and Troubleshooting",
    items: [
      {
        question: "Which devices support StreamVid TV?",
        answer:
          "StreamVid TV is available on smart TVs, mobile devices, tablets, and web browsers.",
      },
      {
        question: "When does Streamvid TV add new shows?",
        answer:
          "New shows are added every month. Stay tuned for updates on our platform.",
      },
      {
        question: "Why isn't a full season of a new show available?",
        answer:
          "Some shows are released episodically. Full seasons may be available after initial release.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-2 md:px-0">
      {/* Title & Description */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          We present 3 packages that you can choose to start watching various
          movies you like at low prices and according to your needs
        </p>
      </div>
      {/* FAQ Groups */}
      <div className="w-full max-w-3xl bg-[#15172b] rounded-2xl p-8 mb-8">
        {faqData.map((group, idx) => (
          <div key={group.group} className="mb-8 last:mb-0">
            <h2 className="text-2xl font-bold text-white mb-6">
              {group.group}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {group.items.map((item, i) => (
                <AccordionItem value={item.question} key={item.question}>
                  <AccordionTrigger className="text-lg font-semibold text-white bg-[#23243a] rounded-xl px-6 py-4 mb-2 data-[state=open]:rounded-b-none">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="bg-[#23243a] text-gray-300 rounded-b-xl px-6 py-4 text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
      {/* Contact Support */}
      <div className="w-full max-w-2xl text-center mt-4">
        <p className="text-gray-300 mb-6 text-base">
          Didn’t find an answer to your question? To contact us directly or
          report a problem, please click below.
        </p>
        <Button className="bg-[#7b5cff] hover:bg-[#6a4ee6] text-white font-bold text-lg px-8 py-3 rounded-xl shadow-md transition-all">
          Contact Support
        </Button>
      </div>
    </div>
  );
};

export default FAQ;
