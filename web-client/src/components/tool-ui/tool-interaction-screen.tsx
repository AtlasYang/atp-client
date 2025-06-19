// import { ToolProviderInterface } from "../../service/tool/interface";

// type ToolInteractionScreenProps = {
//   toolProviderInterface: ToolProviderInterface;
// };

// export default function ToolInteractionScreen({
//   toolProviderInterface,
// }: ToolInteractionScreenProps) {
//   return (
//     <div>
//       <h1>{toolProviderInterface.name}</h1>
//       <p>{toolProviderInterface.description}</p>
//       <img
//         src={toolProviderInterface.imageUrl}
//         alt={toolProviderInterface.name}
//       />
//       <form>
//         {toolProviderInterface.requestInterface.map((request) => {
//           return (
//             <div key={request.id}>
//               <label htmlFor={request.key}>
//                 {request.bindedElementType.label}
//               </label>
//               <input
//                 type={request.bindedElementType.htmlElementType}
//                 id={request.key}
//               />
//             </div>
//           );
//         })}
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// }
